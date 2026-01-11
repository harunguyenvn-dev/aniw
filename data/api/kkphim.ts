
import { Anime, Episode } from '../../types';

const KKPHIM_BASE_URL = 'https://phimapi.com';

// Interfaces cho Response của KKPhim
interface KKPhimItem {
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    thumb_url: string;
    poster_url: string;
    year: number;
}

interface KKPhimListResponse {
    status: boolean;
    items: KKPhimItem[];
    pathImage: string;
    pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
    };
}

interface KKPhimEpisodeData {
    name: string;
    slug: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
}

interface KKPhimServer {
    server_name: string;
    server_data: KKPhimEpisodeData[];
}

interface KKPhimMovieDetail {
    _id: string;
    name: string;
    slug: string;
    origin_name: string;
    content: string;
    type: string;
    status: string;
    thumb_url: string;
    poster_url: string;
    time: string;
    episode_current: string;
    episode_total: string;
    quality: string;
    lang: string;
    year: number;
    category: { id: string; name: string; slug: string }[];
    country: { id: string; name: string; slug: string }[];
}

interface KKPhimDetailResponse {
    status: boolean;
    msg: string;
    movie: KKPhimMovieDetail;
    episodes: KKPhimServer[];
}

/**
 * Lấy danh sách phim mới cập nhật từ KKPhim
 * @param page Số trang cần lấy
 */
export const fetchKKPhimList = async (page: number = 1): Promise<KKPhimListResponse> => {
    try {
        const response = await fetch(`${KKPHIM_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`);
        if (!response.ok) throw new Error(`KKPhim List Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching KKPhim list:", error);
        throw error;
    }
};

/**
 * Lấy chi tiết phim và danh sách tập từ KKPhim
 * @param slug Slug của phim
 */
export const fetchKKPhimDetails = async (slug: string): Promise<Anime | null> => {
    try {
        const response = await fetch(`${KKPHIM_BASE_URL}/phim/${slug}`);
        if (!response.ok) return null; // Bỏ qua nếu lỗi (404, 500)
        
        const data: KKPhimDetailResponse = await response.json();
        
        if (!data.status || !data.movie) return null;

        const movie = data.movie;
        const episodesData: Episode[] = [];

        // Duyệt qua các server để lấy link (ưu tiên m3u8)
        if (data.episodes && data.episodes.length > 0) {
            // Thường KKPhim có server đầu tiên là chính
            const server = data.episodes[0]; 
            
            server.server_data.forEach(ep => {
                episodesData.push({
                    name: movie.name,
                    episodeTitle: `Tập ${ep.name}`,
                    url: '', // Legacy field
                    link: ep.link_m3u8 || ep.link_embed // Ưu tiên m3u8 để player HLS xử lý
                });
            });
        }

        if (episodesData.length === 0) return null;

        return {
            name: movie.name,
            episodes: episodesData
        };

    } catch (error) {
        console.error(`Error fetching detail for ${slug}:`, error);
        return null;
    }
};
