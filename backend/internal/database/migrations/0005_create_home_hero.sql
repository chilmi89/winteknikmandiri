-- Tabel konfigurasi Hero Section pada halaman utama beranda.
CREATE TABLE IF NOT EXISTS home_hero (
    id                    SERIAL PRIMARY KEY,
    
    -- Teks Konten
    badge_text            VARCHAR(150) NOT NULL DEFAULT 'KONTRAKTOR AC • KEDIRI • SEJAK 2014',
    badge_colors          JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    title                 TEXT NOT NULL DEFAULT 'WIN TEKNIK MANDIRI AC KEDIRI',
    title_color           VARCHAR(20) DEFAULT '#FFFFFF',
    title_highlight_color VARCHAR(20) DEFAULT '#FF6B6B',
    title_colors          JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    slogan                VARCHAR(255) DEFAULT 'FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS',
    slogan_colors         JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    description           TEXT NOT NULL DEFAULT 'Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya',
    description_colors    JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Pengaturan Media Latar Belakang
    media_type            VARCHAR(10) NOT NULL DEFAULT 'video' CHECK (media_type IN ('image', 'video')),
    media_url             TEXT NOT NULL DEFAULT '/hero-section/video_hero_ac.mp4',
    thumbnail_url         TEXT DEFAULT '/images/wtm-pemasangan.jpg',
    
    -- Tombol Aksi (CTA)
    cta_primary_text      VARCHAR(50) DEFAULT 'Konsultasi via WhatsApp',
    cta_primary_url       VARCHAR(255) DEFAULT 'https://wa.me/6281216622840',
    cta_secondary_text    VARCHAR(50) DEFAULT 'Lihat layanan',
    cta_secondary_url     VARCHAR(255) DEFAULT '#layanan',
    
    -- Sistem & Status
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed konten awal jika tabel masih kosong
INSERT INTO home_hero (
    badge_text, badge_colors,
    title, title_color, title_highlight_color, title_colors,
    slogan, slogan_colors,
    description, description_colors,
    media_type, media_url, thumbnail_url,
    cta_primary_text, cta_primary_url,
    cta_secondary_text, cta_secondary_url,
    is_active
)
SELECT 
    'KONTRAKTOR AC • KEDIRI • SEJAK 2014', '{"0":"#FFFFFF","1":"#FF6B6B","2":"#8ACFF8","3":"#FFFFFF","4":"#8ACFF8","5":"#FFFFFF","6":"#F59E0B"}'::jsonb,
    'WIN TEKNIK MANDIRI AC KEDIRI', '#FFFFFF', '#FF6B6B', '{"0":"#FF6B6B","1":"#2279CF","2":"#2279CF","3":"#FFFFFF","4":"#FFFFFF"}'::jsonb,
    'FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS', '{"0":"#8ACFF8","1":"#FFFFFF","2":"#8ACFF8","3":"#FFFFFF","4":"#FFFFFF","5":"#FF6B6B","6":"#FFFFFF"}'::jsonb,
    'Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya', '{"3":"#8ACFF8","4":"#FF6B6B","6":"#2279CF","11":"#F59E0B"}'::jsonb,
    'video', '/hero-section/video_hero_ac.mp4', '/images/wtm-pemasangan.jpg',
    'Konsultasi via WhatsApp', 'https://wa.me/6281216622840',
    'Lihat layanan', '#layanan',
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM home_hero);
