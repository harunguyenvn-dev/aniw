
export interface DataSource {
    id: string;
    name: string;
    description: string;
    author: string;
    url: string;
    tags: string[];
}

export const DATA_SOURCES: DataSource[] = [
    {
        id: 'ophim-api',
        name: 'OPhim (API Tự Động)',
        description: 'Kết nối trực tiếp tới máy chủ OPhim. Cập nhật phim mới và phim chiếu rạp liên tục theo thời gian thực. Hỗ trợ HLS Streaming.',
        author: 'OPhim Team',
        url: 'OPHIM_API', // Identifier đặc biệt để App nhận diện
        tags: ['API', 'Auto-Update', 'HLS', 'Huge DB', 'Main'],
        download: "yes"
    },
    {
        id: 'Animehay',
        name: 'Anime Hay',
        description: 'Data này có một số anime sẽ bị thiếu tập',
        author: 'harunguyen',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/anime.csv',
        tags: ['Anime', 'Donghua']
    },
    {
        id: 'zophim',
        name: 'Zophim',
        description: 'Data này có cả anime, donghua và phim truyền hình .',
        author: 'harunguyen',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/api/animehay/data.csv',
        tags: ['Anime', 'Donghua', 'Phim']
    },
        {
        id: 'Ani4u',
        name: 'Ani4u',
        description: 'Data này có cả anime, donghua ( data nay hoi loi mot chut )',
        author: 'harunguyen',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/api/ani4u/data.csv',
        tags: ['Anime', 'Ani4u', 'Phim']
    },
    {
        id: 'hentai 1',
        name: 'hentai 1',
        description: 'Kho data hentai với 2700 bộ xem không bị chán, nếu không xem được thì chọn mở link gốc nhé.',
        author: 'harunguyen',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/api/hen2/data.csv',
        tags: ['18+', 'hentai', '210']
    },
    {
        id: 'hentai 2',
        name: 'hentai 2',
        description: 'Kho data hentai với 458 bộ .',
        author: 'harunguyen',
        url: 'https://raw.githubusercontent.com/harunguyenvn-dev/data/refs/heads/main/api/hen1/data.csv',
        tags: ['18+', 'hentai', '210']
    }
];
