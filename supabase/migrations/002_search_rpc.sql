CREATE OR REPLACE FUNCTION search_network_commands(
    p_query TEXT DEFAULT NULL,
    p_vendor_id UUID DEFAULT NULL,
    p_device_type_slug TEXT DEFAULT NULL,
    p_category_slug TEXT DEFAULT NULL,
    p_limit INT DEFAULT 30,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    command_syntax TEXT,
    full_syntax TEXT,
    prompt_mode TEXT,
    title_vi TEXT,
    description_vi TEXT,
    os_flavor TEXT,
    verification_command TEXT,
    rollback_command TEXT,
    is_destructive BOOLEAN,
    requires_commit BOOLEAN,
    notes_vi TEXT,
    tags TEXT[],
    parameters JSONB,
    examples JSONB,
    warnings JSONB,
    vendor JSONB,
    device_types JSONB,
    canonical_action JSONB,
    relevance_score FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_query TEXT := trim(coalesce(p_query, ''));
    v_unaccented_query TEXT := immutable_unaccent(v_clean_query);
    v_tsquery tsquery;
BEGIN
    IF v_unaccented_query <> '' THEN
        v_tsquery := plainto_tsquery('simple', v_unaccented_query);
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.command_syntax,
        c.full_syntax,
        c.prompt_mode,
        c.title_vi,
        c.description_vi,
        c.os_flavor,
        c.verification_command,
        c.rollback_command,
        c.is_destructive,
        c.requires_commit,
        c.notes_vi,
        c.tags,
        c.parameters,
        c.examples,
        c.warnings,
        jsonb_build_object(
            'id', v.id,
            'name', v.name,
            'slug', v.slug,
            'badge_color', v.badge_color,
            'icon_name', v.icon_name
        ) AS vendor,
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', dt.id,
                        'name', dt.name,
                        'slug', dt.slug,
                        'icon_name', dt.icon_name
                    ) ORDER BY dt.display_order ASC
                )
                FROM command_device_types cdt
                JOIN device_types dt ON dt.id = cdt.device_type_id
                WHERE cdt.command_id = c.id
            ),
            '[]'::jsonb
        ) AS device_types,
        CASE 
            WHEN ca.id IS NOT NULL THEN
                jsonb_build_object(
                    'id', ca.id,
                    'action_key', ca.action_key,
                    'name_vi', ca.name_vi,
                    'category_id', ca.category_id
                )
            ELSE NULL
        END AS canonical_action,
        (
            CASE 
                WHEN v_clean_query = '' THEN 1.0
                ELSE (
                    -- Exact command syntax prefix boost (shorthand e.g., 'sh ip' -> 'show ip interface brief')
                    CASE WHEN c.command_syntax ILIKE v_clean_query || '%' THEN 8.0 ELSE 0.0 END +
                    -- Exact title match boost
                    CASE WHEN immutable_unaccent(c.title_vi) ILIKE '%' || v_unaccented_query || '%' THEN 4.0 ELSE 0.0 END +
                    -- Full-Text search rank weight
                    CASE WHEN v_tsquery IS NOT NULL AND c.search_vector @@ v_tsquery 
                         THEN coalesce(ts_rank_cd(c.search_vector, v_tsquery), 0.0) * 3.5 
                         ELSE 0.0 END +
                    -- Trigram similarity on command syntax
                    similarity(c.command_syntax, v_clean_query) * 4.0 +
                    -- Trigram similarity on Vietnamese title
                    similarity(immutable_unaccent(c.title_vi), v_unaccented_query) * 3.0 +
                    -- Tag array match boost
                    CASE WHEN c.tags @> ARRAY[lower(v_clean_query)] THEN 4.0 ELSE 0.0 END
                )
            END
        )::FLOAT AS relevance_score
    FROM commands c
    JOIN vendors v ON v.id = c.vendor_id
    LEFT JOIN canonical_actions ca ON ca.id = c.canonical_action_id
    LEFT JOIN command_categories cat ON cat.id = ca.category_id
    WHERE
        -- Relational filter: Vendor
        (p_vendor_id IS NULL OR c.vendor_id = p_vendor_id)
        -- Relational filter: Device Type
        AND (
            p_device_type_slug IS NULL OR EXISTS (
                SELECT 1 FROM command_device_types cdt
                JOIN device_types dt ON dt.id = cdt.device_type_id
                WHERE cdt.command_id = c.id AND dt.slug = p_device_type_slug
            )
        )
        -- Relational filter: Category
        AND (p_category_slug IS NULL OR cat.slug = p_category_slug)
        -- Text / Semantic search filter
        AND (
            v_clean_query = ''
            OR (v_tsquery IS NOT NULL AND c.search_vector @@ v_tsquery)
            OR c.command_syntax ILIKE '%' || v_clean_query || '%'
            OR immutable_unaccent(c.title_vi) ILIKE '%' || v_unaccented_query || '%'
            OR immutable_unaccent(c.description_vi) ILIKE '%' || v_unaccented_query || '%'
            OR c.command_syntax % v_clean_query
            OR immutable_unaccent(c.title_vi) % v_unaccented_query
            OR c.tags @> ARRAY[lower(v_clean_query)]
        )
    ORDER BY 
        CASE WHEN v_clean_query = '' THEN 0.0 ELSE relevance_score END DESC,
        c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
