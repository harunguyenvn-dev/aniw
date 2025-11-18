import React from 'react';
import { Settings } from '../types';

const GlossarySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-theme-olive dark:text-theme-lime border-b-2 border-theme-lime/30 pb-3 mb-6">
            {title}
        </h2>
        <ul className="space-y-5">
            {children}
        </ul>
    </div>
);

const GlossaryItem: React.FC<{ term: string; definition: string }> = ({ term, definition }) => (
    <li className="flex flex-col sm:flex-row">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 w-full sm:w-1/3 md:w-1/4 flex-shrink-0">
            {term}
        </p>
        <p className="text-slate-600 dark:text-slate-400 sm:pl-4">
            {definition}
        </p>
    </li>
);

interface GlossaryProps {
    containerClassName?: string;
    settings: Settings;
}

const Glossary: React.FC<GlossaryProps> = ({ containerClassName, settings }) => {
    const noteClasses = ['glass-ui', 'liquid-glass'].includes(settings.theme)
        ? 'glass-card rounded-lg p-4 text-left my-10'
        : 'bg-lime-500/10 dark:bg-lime-500/10 border-l-4 border-theme-lime/50 rounded-r-lg p-4 text-left my-10';

    return (
        <main className={containerClassName}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-6">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-theme-lime to-theme-mint">
                       Thuật Ngữ Anime & Manga
                    </span>
                </h1>
                <div className={noteClasses}>
                    <p className="text-sm text-theme-olive dark:text-theme-lime">
                        <span className="font-bold">🔔 Lưu ý:</span> Một số từ ngữ có thể chưa hoàn toàn chính xác hoặc thay đổi theo cộng đồng.
                    </p>
                </div>

                <GlossarySection title="1️⃣ Otaku & Các Thể Loại Người Hâm Mộ">
                    <GlossaryItem term="🎌 Otaku:" definition="Từ tiêu cực ở Nhật, nhưng được yêu thích ở phương Tây." />
                    <GlossaryItem term="💖 Fanboy / Fangirl:" definition="Fan cực kỳ cuồng một anime, manga hoặc nhân vật." />
                    <GlossaryItem term="🌐 Fandom:" definition="Cộng đồng người có chung đam mê." />
                </GlossarySection>

                <GlossarySection title="2️⃣ Phân Loại Anime/Manga Theo Đối Tượng">
                    <GlossaryItem term="🧒 Kodomo:" definition="Dành cho trẻ em – Doraemon, Pokémon." />
                    <GlossaryItem term="👦 Shounen:" definition="Dành cho thiếu niên nam – Naruto, One Piece." />
                    <GlossaryItem term="👧 Shoujo:" definition="Dành cho thiếu nữ – Cardcaptor Sakura." />
                    <GlossaryItem term="🧔 Seinen:" definition="Dành cho nam giới trưởng thành – Berserk, Tokyo Ghoul." />
                    <GlossaryItem term="👩 Josei:" definition="Dành cho phụ nữ trưởng thành – Nana, Paradise Kiss." />
                </GlossarySection>

                <GlossarySection title="3️⃣ Phân Loại Theo Tình Cảm – Giới Tính">
                    <GlossaryItem term="💙 Shounen-ai:" definition="Tình cảm nhẹ nhàng giữa nam." />
                    <GlossaryItem term="🔥 Yaoi:" definition="BL cấp độ cao, có yếu tố thể xác." />
                    <GlossaryItem term="💗 Shoujo-ai:" definition="Tình cảm nhẹ nhàng giữa nữ." />
                    <GlossaryItem term="🌸 Yuri:" definition="GL cấp độ cao, có yếu tố thể xác." />
                    <GlossaryItem term="😳 Ecchi:" definition="Gợi cảm hài hước, không quá giới hạn." />
                    <GlossaryItem term="🔞 Hentai:" definition="Nội dung khiêu dâm 18+." />
                    <GlossaryItem term="🍋 Lemon:" definition="Fanfic có yếu tố tình dục." />
                </GlossarySection>

                <GlossarySection title="4️⃣ Các Kiểu Nhân Vật (Archetypes)">
                    <GlossaryItem term="🌶️ Tsundere:" definition="Ngoài lạnh – trong nóng. Classic: Hay đánh đập, bạo lực. Modern: Biến đổi cảm xúc nhanh." />
                    <GlossaryItem term="🔪 Yandere:" definition="Ngoài hiền, trong điên cuồng – có thể giết người vì yêu." />
                    <GlossaryItem term="🙊 Dandere:" definition="Nhút nhát, ít nói." />
                    <GlossaryItem term="❄️ Coodere:" definition="Lạnh lùng, chỉ ấm áp với người thân thiết." />
                    <GlossaryItem term="⚠️ Mayadere:" definition="Nguy hiểm, có thể trở mặt hoặc yêu đến điên cuồng." />
                </GlossarySection>

                <GlossarySection title="5️⃣ Thuật Ngữ Sản Xuất Anime">
                    <GlossaryItem term="🎙️ Seiyuu:" definition="Diễn viên lồng tiếng." />
                    <GlossaryItem term="🎛️ ADR:" definition="Lồng tiếng khớp khẩu hình." />
                    <GlossaryItem term="🎵 OP/ED:" definition="Nhạc mở đầu / kết thúc." />
                    <GlossaryItem term="🎶 OST:" definition="Toàn bộ nhạc phim chính thức." />
                    <GlossaryItem term="🎼 BGM:" definition="Nhạc nền." />
                    <GlossaryItem term="💻 CG/CGI:" definition="Đồ họa máy tính." />
                    <GlossaryItem term="🖥️ CG Division:" definition="Bộ phận xử lý CG." />
                    <GlossaryItem term="🔁 Eye Catch:" definition="Chèn ngắt giữa phim hoặc trước/giữa quảng cáo." />
                    <GlossaryItem term="📺 Episode (Ep):" definition="Một tập phim." />
                </GlossarySection>

                <GlossarySection title="6️⃣ Các Hình Thức Phát Hành Anime">
                    <GlossaryItem term="📡 TV Series:" definition="Chiếu truyền hình dài tập." />
                    <GlossaryItem term="📀 OVA/OAV:" definition="Ra đĩa trực tiếp, chất lượng cao." />
                    <GlossaryItem term="🎬 Anime Movie:" definition="Chiếu rạp, đầu tư công phu." />
                    <GlossaryItem term="🎁 Omake:" definition="Đoạn ngắn bonus hài hước." />
                </GlossarySection>
                
                <GlossarySection title="7️⃣ Thuật Ngữ Fan">
                    <GlossaryItem term="📝 Fansub:" definition="Phụ đề fan tự làm." />
                    <GlossaryItem term="🔊 Dub:" definition="Phim lồng tiếng." />
                    <GlossaryItem term="📂 RAW:" definition="Bản gốc chưa dịch." />
                    <GlossaryItem term="💻 Digisub:" definition="Sub số hóa cho máy tính." />
                    <GlossaryItem term="🎨 Fanart:" definition="Tranh fan vẽ." />
                    <GlossaryItem term="✍️ Fanfiction:" definition="Truyện fan viết." />
                    <GlossaryItem term="📚 Doujinshi:" definition="Manga fan làm không chính thức." />
                    <GlossaryItem term="🖊️ Doujinshika:" definition="Tác giả doujinshi." />
                    <GlossaryItem term="🎧 AMV:" definition="Video nhạc dựng bằng anime." />
                </GlossarySection>

                <GlossarySection title="8️⃣ Game & Cosplay">
                    <GlossaryItem term="🧙 RPG:" definition="Trò chơi nhập vai." />
                    <GlossaryItem term="🎭 Cosplay:" definition="Hóa thân thành nhân vật." />
                    <GlossaryItem term="👗 Cosplayer / Coser:" definition="Người cosplay." />
                    <GlossaryItem term="✨ Henshin:" definition="Biến hình – thường dùng trong Sailor Moon, Tokusatsu." />
                </GlossarySection>

                <GlossarySection title="9️⃣ Các Danh Xưng Trong Tiếng Nhật">
                    <GlossaryItem term="👴 Senpai:" definition="Tiền bối." />
                    <GlossaryItem term="👶 Kouhai:" definition="Hậu bối." />
                    <GlossaryItem term="🧑 San:" definition="Kính ngữ trung lập." />
                    <GlossaryItem term="👦 Kun:" definition="Dành cho con trai, thân mật." />
                    <GlossaryItem term="👧 Chan:" definition="Dễ thương, gần gũi." />
                    <GlossaryItem term="👑 Sama:" definition="Kính trọng cực độ (VIP)." />
                </GlossarySection>
            </div>
        </main>
    );
};

export default Glossary;