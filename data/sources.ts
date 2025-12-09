
export interface DataSource {
    id: string;
    name: string;
    description: string;
    author: string;
    url: string;
    tags: string[];
    download?: "yes" | "no";
}

export const DATA_SOURCES: DataSource[] = [
    {
        id: 'official-source',
        name: 'Kho Anime Chính (Official)',
        description: 'Nguồn dữ liệu gốc ổn định nhất, được kiểm duyệt kỹ càng. Bao gồm các bộ anime phổ biến theo mùa.',
        author: 'AniW Team',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv',
        tags: ['Official', 'Stable', 'Recommended'],
        download: "no"
    },
    {
        id: 'ophim-api',
        name: 'OPhim (API Tự Động)',
        description: 'Kết nối trực tiếp tới máy chủ OPhim. Cập nhật phim mới và phim chiếu rạp liên tục theo thời gian thực. Hỗ trợ HLS Streaming.',
        author: 'OPhim Team',
        url: 'OPHIM_API', 
        tags: ['API', 'Auto-Update', 'HLS', 'Huge DB'],
        download: "yes"
    },
    {
        id: 'beta-source',
        name: 'Kho Thử Nghiệm (Beta Channel)',
        description: 'Cập nhật nhanh nhất các bộ anime mới ra mắt. Có thể chứa lỗi hoặc link chưa ổn định, dành cho người thích khám phá.',
        author: 'AniW Labs',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime-beta.csv',
        tags: ['Beta', 'New', 'Unstable'],
        download: "no"
    },
    {
        id: 'retro-collection',
        name: 'Góc Hoài Niệm (Retro & Classic)',
        description: 'Tổng hợp những bộ anime huyền thoại từ thập niên 90s và 2000s. Dành cho những tâm hồn hoài cổ.',
        author: 'OldSchoolWibu',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime-retro.csv',
        tags: ['Retro', 'Classic', '90s'],
        download: "no"
    },
    {
        id: 'movie-special',
        name: 'Rạp Chiếu Phim (Movies)',
        description: 'Chuyên trang các Anime Movie chiếu rạp, chất lượng cao, âm thanh sống động.',
        author: 'Cinephile',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime-movies.csv',
        tags: ['Movie', '4K', 'High Quality'],
        download: "no"
    },
    {
        id: 'healing-chill',
        name: 'Trạm Chữa Lành (Iyashikei)',
        description: 'Những bộ anime nhẹ nhàng, đời thường (Slice of Life) giúp thư giãn sau ngày làm việc căng thẳng.',
        author: 'Hân & Hoàng',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime-chill.csv',
        tags: ['Chill', 'Relax', 'Slice of Life'],
        download: "no"
    }
];