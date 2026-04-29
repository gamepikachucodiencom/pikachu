/**
 * Database Seed Script for Demo Admin and Content
 * 
 * This script:
 * 1. Creates/gets an admin user account (admin@cotuong.online)
 * 2. Creates/updates admin profile with elo_rating: 9999
 * 3. Seeds 8 Vietnamese blog articles linked to the admin account
 * 
 * Usage:
 *   npm run seed:demo
 *   OR
 *   npx tsx scripts/seed-demo.ts
 * 
 * Required Environment Variables (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * 
 * Note: This script uses Supabase Admin API (Service Role) to bypass RLS policies.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local');
  
  if (!existsSync(envPath)) {
    console.warn('⚠️  Warning: .env.local file not found at:', envPath);
    console.warn('   The script will use environment variables from process.env');
    console.warn('   Make sure to set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.warn('');
    return;
  }

  console.log('📄 Loading environment variables from .env.local...');
  
  // Try dotenv first (if installed)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    dotenv.config({ path: envPath });
    console.log('✅ Loaded using dotenv');
    return;
  } catch {
    // dotenv not installed, manually parse .env.local
    console.log('ℹ️  dotenv not found, parsing .env.local manually...');
  }

  // Fallback: manually parse .env.local
  const envFile = readFileSync(envPath, 'utf-8');
  const lines = envFile.split('\n');
  let loadedCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only set if not already in process.env (env vars take precedence)
      if (!process.env[key]) {
        process.env[key] = value;
        loadedCount++;
      }
    }
  }
  
  console.log(`✅ Loaded ${loadedCount} environment variables from .env.local`);
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: Show what was loaded (without exposing sensitive data)
console.log('📋 Environment variables check:');
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'} ${supabaseUrl ? `(${supabaseUrl.substring(0, 30)}...)` : ''}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✅ Set' : '❌ Missing'} ${supabaseServiceRoleKey ? `(${supabaseServiceRoleKey.substring(0, 20)}...)` : ''}`);
console.log('');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables!');
  console.error('');
  console.error('Please ensure your .env.local file contains:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('');
  console.error('You can find these values in:');
  console.error('   Supabase Dashboard → Settings → API');
  console.error('');
  process.exit(1);
}

// Validate the service role key format (should start with 'eyJ' for JWT)
if (!supabaseServiceRoleKey.startsWith('eyJ')) {
  console.error('⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY does not appear to be a valid JWT token.');
  console.error('   Service role keys typically start with "eyJ"');
  console.error('   Please verify you are using the SERVICE_ROLE key, not the ANON key');
  console.error('');
}

// Create Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin account configuration
const ADMIN_EMAIL = 'admin@cotuong.online';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_USERNAME = 'Quản Trị Viên';
const ADMIN_AVATAR_URL = 'https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff&size=128';

// Blog articles data (Vietnamese content)
const BLOG_ARTICLES = [
  {
    slug: 'luat-choi-co-tuong-co-ban-cho-nguoi-moi-bat-dau',
    title: 'Luật chơi Cờ Tướng cơ bản cho người mới bắt đầu',
    excerpt: 'Hướng dẫn chi tiết về luật chơi Cờ Tướng, cách di chuyển các quân cờ, và các quy tắc cơ bản để bạn có thể bắt đầu chơi ngay hôm nay.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Xiangqi+Strategy',
    content: `<h2>Giới thiệu về Cờ Tướng</h2>
<p>Cờ Tướng là một môn cờ cổ truyền của Trung Quốc, được chơi rộng rãi tại Việt Nam và nhiều quốc gia châu Á. Đây là một trò chơi trí tuệ đòi hỏi sự tính toán và chiến lược.</p>

<h2>Bàn cờ và quân cờ</h2>
<p>Bàn cờ Tướng có hình chữ nhật, gồm 9 đường dọc và 10 đường ngang, tạo thành 90 điểm giao nhau. Ở giữa bàn cờ có một khoảng trống gọi là "sông" (hà), chia bàn cờ thành hai phần đối xứng.</p>

<h2>Các quân cờ và cách di chuyển</h2>
<ul>
  <li><strong>Tướng:</strong> Di chuyển 1 ô theo chiều dọc hoặc ngang, chỉ được ở trong "cung" (3x3). Mục tiêu là bắt được Tướng đối phương.</li>
  <li><strong>Sĩ:</strong> Di chuyển 1 ô theo đường chéo, chỉ được ở trong cung.</li>
  <li><strong>Tượng:</strong> Di chuyển 2 ô theo đường chéo, không được vượt sông.</li>
  <li><strong>Xe:</strong> Di chuyển theo đường thẳng, không giới hạn số ô.</li>
  <li><strong>Pháo:</strong> Di chuyển như Xe, nhưng khi ăn quân phải nhảy qua 1 quân cờ.</li>
  <li><strong>Mã:</strong> Di chuyển theo hình chữ L (2 ô thẳng + 1 ô chéo).</li>
  <li><strong>Tốt:</strong> Di chuyển 1 ô thẳng về phía trước, khi qua sông có thể di chuyển ngang.</li>
</ul>

<h2>Luật chơi cơ bản</h2>
<p>Người chơi lần lượt di chuyển quân cờ của mình. Mục tiêu là "chiếu" (đe dọa bắt) Tướng đối phương và cuối cùng là "chiếu bí" (Tướng không thể tránh được).</p>

<h2>Kết luận</h2>
<p>Với những kiến thức cơ bản này, bạn đã có thể bắt đầu chơi Cờ Tướng. Hãy thực hành thường xuyên để nâng cao kỹ năng!</p>`,
    article_type: 'Guide',
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: 'Luật chơi Cờ Tướng cơ bản - Hướng dẫn cho người mới',
    meta_description: 'Học luật chơi Cờ Tướng từ cơ bản đến nâng cao. Hướng dẫn chi tiết cách di chuyển các quân cờ và các quy tắc quan trọng.',
    meta_keywords: ['cờ tướng', 'luật chơi', 'hướng dẫn', 'người mới bắt đầu'],
  },
  {
    slug: '7-the-khai-cuoc-phao-dau-manh-nhat',
    title: '7 Thế Khai Cuộc Pháo Đầu mạnh nhất',
    excerpt: 'Khám phá 7 thế khai cuộc Pháo Đầu hiệu quả nhất trong Cờ Tướng, giúp bạn giành ưu thế ngay từ đầu ván cờ.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Chess+Opening',
    content: `<h2>Giới thiệu về Khai Cuộc Pháo Đầu</h2>
<p>Khai cuộc Pháo Đầu là một trong những cách khai cuộc phổ biến và mạnh mẽ nhất trong Cờ Tướng. Nó tập trung vào việc kiểm soát trung tâm và tạo áp lực sớm lên đối phương.</p>

<h2>1. Pháo Đầu đối Pháo Đầu</h2>
<p>Đây là thế khai cuộc cổ điển nhất. Cả hai bên đều đưa Pháo lên giữa, tạo thế đối công mãnh liệt. Thế này đòi hỏi người chơi phải tính toán kỹ từng nước đi.</p>

<h2>2. Pháo Đầu đối Bình Phong Mã</h2>
<p>Khi đối phương dùng Pháo Đầu, bạn có thể chống lại bằng Bình Phong Mã. Thế này tạo sự cân bằng và phòng thủ vững chắc.</p>

<h2>3. Pháo Đầu đối Phản Cung Mã</h2>
<p>Thế này sử dụng Mã để phản công lại Pháo Đầu. Đây là một cách chơi linh hoạt, cho phép bạn chuyển từ phòng thủ sang tấn công nhanh chóng.</p>

<h2>4. Pháo Đầu Tam Bình Phong</h2>
<p>Một biến thể mạnh mẽ của Pháo Đầu, kết hợp với Bình Phong Mã để tạo thế tấn công đa dạng. Thế này rất khó phòng thủ.</p>

<h2>5. Pháo Đầu Ngũ Thất Pháo</h2>
<p>Thế khai cuộc này tập trung vào việc phát triển quân nhanh chóng. Nó tạo ra nhiều cơ hội tấn công nhưng cũng đòi hỏi sự chính xác cao.</p>

<h2>6. Pháo Đầu Thất Tinh Tụ Hội</h2>
<p>Một thế khai cuộc phức tạp với nhiều biến thể. Thế này phù hợp với những người chơi có kinh nghiệm và khả năng tính toán sâu.</p>

<h2>7. Pháo Đầu Đối Xe</h2>
<p>Thế này sử dụng Xe để đối phó với Pháo Đầu. Đây là cách chơi thực dụng, tạo ra nhiều cơ hội trao đổi quân có lợi.</p>

<h2>Kết luận</h2>
<p>Mỗi thế khai cuộc Pháo Đầu đều có điểm mạnh và điểm yếu riêng. Quan trọng là bạn phải hiểu rõ từng thế và biết cách ứng biến tùy theo tình huống cụ thể.</p>`,
    article_type: 'Openings',
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: '7 Thế Khai Cuộc Pháo Đầu mạnh nhất trong Cờ Tướng',
    meta_description: 'Tổng hợp 7 thế khai cuộc Pháo Đầu hiệu quả nhất, giúp bạn giành ưu thế ngay từ đầu ván cờ.',
    meta_keywords: ['khai cuộc', 'pháo đầu', 'cờ tướng', 'chiến thuật'],
  },
  {
    slug: 'ky-thuat-co-tan-don-ma-thang-don-si',
    title: 'Kỹ thuật Cờ Tàn: Đơn Mã thắng Đơn Sĩ',
    excerpt: 'Học cách chiến thắng trong thế cờ tàn với Đơn Mã đối Đơn Sĩ - một kỹ thuật quan trọng mà mọi người chơi cần nắm vững.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Endgame+Tactics',
    content: `<h2>Giới thiệu về Cờ Tàn</h2>
<p>Cờ tàn là giai đoạn cuối của ván cờ, khi số quân cờ còn lại rất ít. Đây là giai đoạn đòi hỏi kỹ thuật cao và sự chính xác tuyệt đối.</p>

<h2>Thế cờ Đơn Mã đối Đơn Sĩ</h2>
<p>Trong thế cờ này, bên tấn công có 1 Mã và 1 Tướng, bên phòng thủ có 1 Sĩ và 1 Tướng. Về lý thuyết, Mã có thể thắng Sĩ nếu biết cách chơi đúng.</p>

<h2>Nguyên tắc cơ bản</h2>
<ul>
  <li><strong>Kiểm soát trung tâm:</strong> Mã cần chiếm vị trí trung tâm để tạo nhiều cơ hội tấn công.</li>
  <li><strong>Ép Sĩ vào góc:</strong> Mục tiêu là ép Sĩ vào vị trí không thể bảo vệ Tướng hiệu quả.</li>
  <li><strong>Phối hợp Tướng:</strong> Tướng phải hỗ trợ Mã bằng cách chiếm các vị trí chiến lược.</li>
</ul>

<h2>Các bước thực hiện</h2>
<p><strong>Bước 1:</strong> Đưa Mã vào vị trí trung tâm, tạo áp lực lên Sĩ và Tướng đối phương.</p>
<p><strong>Bước 2:</strong> Sử dụng Tướng để kiểm soát các đường dọc, ngăn Tướng đối phương di chuyển tự do.</p>
<p><strong>Bước 3:</strong> Ép Sĩ vào góc hoặc vị trí yếu, tạo cơ hội cho Mã tấn công trực tiếp vào Tướng.</p>
<p><strong>Bước 4:</strong> Khi Sĩ bị ép vào góc, Mã có thể tạo thế "chiếu bí" bằng cách phối hợp với Tướng.</p>

<h2>Lưu ý quan trọng</h2>
<p>Thế cờ này đòi hỏi sự kiên nhẫn và chính xác. Nếu không cẩn thận, bạn có thể để đối phương hòa cờ hoặc thậm chí thua cờ.</p>

<h2>Kết luận</h2>
<p>Kỹ thuật Đơn Mã thắng Đơn Sĩ là một kỹ năng cơ bản trong cờ tàn. Hãy luyện tập thường xuyên để thành thạo thế cờ này.</p>`,
    article_type: 'Endgame',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: 'Kỹ thuật Cờ Tàn: Đơn Mã thắng Đơn Sĩ',
    meta_description: 'Hướng dẫn chi tiết cách chiến thắng trong thế cờ tàn Đơn Mã đối Đơn Sĩ với các nguyên tắc và bước thực hiện cụ thể.',
    meta_keywords: ['cờ tàn', 'đơn mã', 'đơn sĩ', 'kỹ thuật'],
  },
  {
    slug: 'luat-choi-co-up-chi-tiet-va-su-khac-biet-voi-co-tuong',
    title: 'Luật chơi Cờ Úp chi tiết và sự khác biệt với Cờ Tướng',
    excerpt: 'Tìm hiểu về Cờ Úp - một biến thể thú vị của Cờ Tướng, nơi các quân cờ được úp ngược và người chơi không biết quân cờ của mình là gì.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Xiangqi+Strategy',
    content: `<h2>Cờ Úp là gì?</h2>
<p>Cờ Úp (hay Cờ Triều Châu) là một biến thể của Cờ Tướng, trong đó các quân cờ được úp ngược và người chơi không biết quân cờ của mình là gì cho đến khi lật ra. Điều này tạo ra yếu tố may rủi và chiến thuật thú vị.</p>

<h2>Sự khác biệt chính với Cờ Tướng</h2>
<ul>
  <li><strong>Quân cờ bị úp:</strong> Tất cả quân cờ (trừ Tướng) đều bị úp ngược khi bắt đầu ván cờ.</li>
  <li><strong>Không biết quân cờ:</strong> Người chơi không biết quân cờ của mình là gì cho đến khi di chuyển hoặc bị ăn.</li>
  <li><strong>Luật di chuyển:</strong> Khi di chuyển một quân úp, nó phải tuân theo luật di chuyển của quân cờ ở vị trí đó (theo luật Cờ Tướng thông thường).</li>
  <li><strong>Lật quân:</strong> Khi một quân úp di chuyển hoặc ăn quân, nó sẽ được lật ra để tiết lộ loại quân cờ.</li>
</ul>

<h2>Luật chơi chi tiết</h2>
<h3>Bố trí ban đầu</h3>
<p>Quân cờ được sắp xếp giống như Cờ Tướng thông thường, nhưng tất cả (trừ Tướng) đều bị úp. Chỉ có Tướng là được lật ra từ đầu.</p>

<h3>Di chuyển quân cờ</h3>
<p>Khi bạn di chuyển một quân úp, bạn phải di chuyển nó theo luật của quân cờ ở vị trí đó. Ví dụ, nếu quân ở vị trí của Xe, bạn phải di chuyển nó như một Xe, dù thực tế nó có thể là Mã hoặc Pháo.</p>

<h3>Ăn quân</h3>
<p>Khi một quân úp ăn quân đối phương, cả hai quân đều được lật ra. Nếu quân của bạn mạnh hơn, bạn sẽ ăn được quân đối phương.</p>

<h3>Chiếu và Chiếu bí</h3>
<p>Luật chiếu và chiếu bí giống như Cờ Tướng thông thường. Tuy nhiên, bạn phải cẩn thận vì không biết quân cờ của mình là gì.</p>

<h2>Chiến thuật chơi Cờ Úp</h2>
<ul>
  <li><strong>Ghi nhớ vị trí:</strong> Cố gắng nhớ các quân cờ đã được lật ra và vị trí của chúng.</li>
  <li><strong>Thăm dò:</strong> Sử dụng các quân úp để thăm dò và tạo áp lực.</li>
  <li><strong>Rủi ro và phần thưởng:</strong> Đôi khi bạn phải chấp nhận rủi ro để giành lợi thế.</li>
</ul>

<h2>Kết luận</h2>
<p>Cờ Úp là một biến thể thú vị và đầy thử thách của Cờ Tướng. Nó đòi hỏi không chỉ kỹ năng chiến thuật mà còn khả năng ghi nhớ và tính toán rủi ro. Hãy thử chơi Cờ Úp để trải nghiệm một cách chơi hoàn toàn mới!</p>`,
    article_type: 'Guide',
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: 'Luật chơi Cờ Úp - Sự khác biệt với Cờ Tướng',
    meta_description: 'Hướng dẫn chi tiết về luật chơi Cờ Úp, một biến thể thú vị của Cờ Tướng với các quân cờ bị úp ngược.',
    meta_keywords: ['cờ úp', 'cờ triều châu', 'biến thể', 'luật chơi'],
  },
  {
    slug: 'lich-su-hinh-thanh-va-phat-trien-cua-co-tuong',
    title: 'Lịch sử hình thành và phát triển của Cờ Tướng',
    excerpt: 'Khám phá lịch sử lâu đời của Cờ Tướng, từ nguồn gốc cổ xưa ở Trung Quốc đến sự phổ biến rộng rãi tại Việt Nam và các nước châu Á.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Xiangqi+Strategy',
    content: `<h2>Nguồn gốc cổ xưa</h2>
<p>Cờ Tướng (Xiangqi) có lịch sử hơn 2000 năm, xuất phát từ Trung Quốc cổ đại. Nhiều học giả cho rằng Cờ Tướng được phát triển từ một trò chơi cờ cổ có tên là "Liubo" vào thời nhà Chu (khoảng thế kỷ 6 TCN).</p>

<h2>Sự phát triển qua các triều đại</h2>
<h3>Thời nhà Hán (206 TCN - 220 SCN)</h3>
<p>Vào thời nhà Hán, Cờ Tướng bắt đầu có hình dạng gần giống với ngày nay. Các quân cờ và luật chơi được chuẩn hóa dần.</p>

<h3>Thời nhà Đường (618 - 907)</h3>
<p>Đây là thời kỳ hoàng kim của Cờ Tướng. Trò chơi trở nên phổ biến trong giới quý tộc và học giả. Nhiều tác phẩm về Cờ Tướng được viết trong thời kỳ này.</p>

<h3>Thời nhà Tống (960 - 1279)</h3>
<p>Cờ Tướng phát triển mạnh mẽ và trở thành một phần quan trọng của văn hóa Trung Hoa. Nhiều thế cờ và chiến thuật mới được phát minh.</p>

<h2>Cờ Tướng tại Việt Nam</h2>
<p>Cờ Tướng du nhập vào Việt Nam từ rất sớm, có thể từ thời Bắc thuộc. Trải qua hàng ngàn năm, Cờ Tướng đã trở thành một phần không thể thiếu của văn hóa Việt Nam.</p>

<p>Ngày nay, Cờ Tướng được chơi rộng rãi tại Việt Nam, từ các quán cà phê đến các giải đấu chuyên nghiệp. Nhiều kỳ thủ Việt Nam đã đạt được thành tích cao trong các giải đấu quốc tế.</p>

<h2>Sự phổ biến hiện đại</h2>
<p>Với sự phát triển của internet, Cờ Tướng ngày càng trở nên phổ biến trên toàn thế giới. Nhiều nền tảng trực tuyến cho phép người chơi từ khắp nơi trên thế giới thi đấu với nhau.</p>

<h2>Ảnh hưởng văn hóa</h2>
<p>Cờ Tướng không chỉ là một trò chơi, mà còn là một phần của văn hóa và triết học phương Đông. Nó dạy người chơi về:</p>
<ul>
  <li><strong>Chiến lược và tầm nhìn:</strong> Phải suy nghĩ nhiều bước trước.</li>
  <li><strong>Sự kiên nhẫn:</strong> Một ván cờ có thể kéo dài hàng giờ.</li>
  <li><strong>Sự cân bằng:</strong> Giữa tấn công và phòng thủ.</li>
  <li><strong>Trí tuệ:</strong> Đòi hỏi khả năng tính toán và phân tích.</li>
</ul>

<h2>Kết luận</h2>
<p>Lịch sử của Cờ Tướng là một hành trình dài và đầy thú vị. Từ một trò chơi cổ xưa ở Trung Quốc, nó đã trở thành một môn thể thao trí tuệ được yêu thích trên toàn thế giới. Cờ Tướng không chỉ là một trò chơi, mà còn là di sản văn hóa quý giá của nhân loại.</p>`,
    article_type: 'Guide',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: 'Lịch sử Cờ Tướng - Hành trình 2000 năm',
    meta_description: 'Khám phá lịch sử hình thành và phát triển của Cờ Tướng từ Trung Quốc cổ đại đến Việt Nam hiện đại.',
    meta_keywords: ['lịch sử', 'cờ tướng', 'văn hóa', 'trung quốc', 'việt nam'],
  },
  {
    slug: '5-sai-lam-thuong-gap-trong-khai-cuoc-co-tuong',
    title: '5 Sai lầm thường gặp trong Khai Cuộc Cờ Tướng',
    excerpt: 'Tránh những sai lầm phổ biến trong giai đoạn khai cuộc để không bị mất thế ngay từ đầu ván cờ.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Chess+Opening',
    content: `<h2>Tầm quan trọng của Khai Cuộc</h2>
<p>Khai cuộc là giai đoạn đầu của ván cờ, quyết định rất lớn đến kết quả cuối cùng. Một khai cuộc tốt sẽ tạo nền tảng vững chắc cho các giai đoạn sau.</p>

<h2>5 Sai lầm thường gặp</h2>

<h3>1. Di chuyển quân cờ quá nhiều lần</h3>
<p>Nhiều người chơi mắc lỗi di chuyển cùng một quân cờ nhiều lần trong khai cuộc. Điều này làm lãng phí thời gian và cho phép đối phương phát triển quân nhanh hơn.</p>
<p><strong>Giải pháp:</strong> Mỗi quân cờ chỉ nên di chuyển 1-2 lần trong khai cuộc, trừ khi có lý do chiến thuật cụ thể.</p>

<h3>2. Không phát triển quân đều</h3>
<p>Chỉ tập trung phát triển một vài quân cờ mạnh mà bỏ quên các quân khác. Điều này tạo ra sự mất cân bằng và dễ bị tấn công.</p>
<p><strong>Giải pháp:</strong> Phát triển tất cả các quân cờ một cách cân bằng, đặc biệt là Xe, Mã, và Pháo.</p>

<h3>3. Tấn công quá sớm</h3>
<p>Nhiều người chơi muốn tấn công ngay từ đầu mà chưa chuẩn bị đầy đủ. Điều này thường dẫn đến thất bại vì quân cờ chưa được phát triển đầy đủ.</p>
<p><strong>Giải pháp:</strong> Ưu tiên phát triển quân và kiểm soát trung tâm trước khi tấn công.</p>

<h3>4. Bỏ qua việc bảo vệ Tướng</h3>
<p>Một số người chơi quá tập trung vào tấn công mà quên bảo vệ Tướng. Điều này rất nguy hiểm vì có thể bị chiếu bí sớm.</p>
<p><strong>Giải pháp:</strong> Luôn đảm bảo Tướng được bảo vệ bởi Sĩ và Tượng, đặc biệt là trong khai cuộc.</p>

<h3>5. Không có kế hoạch rõ ràng</h3>
<p>Di chuyển quân cờ một cách ngẫu nhiên mà không có chiến lược cụ thể. Điều này làm bạn dễ bị đối phương dẫn dắt.</p>
<p><strong>Giải pháp:</strong> Học các thế khai cuộc cơ bản và có kế hoạch rõ ràng trước khi bắt đầu ván cờ.</p>

<h2>Kết luận</h2>
<p>Tránh những sai lầm trên sẽ giúp bạn cải thiện đáng kể khả năng chơi cờ. Hãy luyện tập thường xuyên và học hỏi từ các ván cờ của những kỳ thủ giỏi.</p>`,
    article_type: 'Openings',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: '5 Sai lầm thường gặp trong Khai Cuộc Cờ Tướng',
    meta_description: 'Tổng hợp các sai lầm phổ biến trong khai cuộc và cách khắc phục để cải thiện kỹ năng chơi cờ.',
    meta_keywords: ['khai cuộc', 'sai lầm', 'kỹ thuật', 'cờ tướng'],
  },
  {
    slug: 'ky-thuat-co-tan-co-ban-cho-nguoi-moi',
    title: 'Kỹ thuật Cờ Tàn cơ bản cho người mới',
    excerpt: 'Học các kỹ thuật cờ tàn cơ bản để có thể kết thúc ván cờ một cách hiệu quả và giành chiến thắng.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Endgame+Tactics',
    content: `<h2>Cờ Tàn là gì?</h2>
<p>Cờ tàn là giai đoạn cuối của ván cờ, khi số quân cờ còn lại rất ít (thường là 3-5 quân mỗi bên). Đây là giai đoạn quyết định, nơi một nước đi sai có thể dẫn đến thất bại.</p>

<h2>Tầm quan trọng của Cờ Tàn</h2>
<p>Nhiều người chơi coi nhẹ cờ tàn, nhưng đây là giai đoạn quan trọng nhất. Ngay cả khi bạn có ưu thế lớn trong khai cuộc và trung cuộc, nếu không biết cách chơi cờ tàn, bạn vẫn có thể thua.</p>

<h2>Các kỹ thuật cơ bản</h2>

<h3>1. Phối hợp Tướng và quân tấn công</h3>
<p>Tướng không chỉ là quân cần bảo vệ, mà còn là một vũ khí tấn công mạnh mẽ trong cờ tàn. Hãy sử dụng Tướng để hỗ trợ các quân tấn công của bạn.</p>

<h3>2. Kiểm soát các điểm quan trọng</h3>
<p>Trong cờ tàn, việc kiểm soát các điểm chiến lược (như trung tâm, các đường dọc/ngang quan trọng) là rất quan trọng. Điều này giúp bạn hạn chế khả năng di chuyển của đối phương.</p>

<h3>3. Tạo thế "Chiếu bí"</h3>
<p>Mục tiêu cuối cùng là tạo thế "chiếu bí" - khi Tướng đối phương không thể tránh được. Để làm điều này, bạn cần phối hợp các quân cờ một cách hiệu quả.</p>

<h3>4. Tránh hòa cờ</h3>
<p>Khi bạn có ưu thế, hãy cẩn thận không để đối phương hòa cờ. Một số thế cờ tàn có thể dẫn đến hòa cờ nếu không chơi đúng.</p>

<h2>Một số thế cờ tàn phổ biến</h2>
<ul>
  <li><strong>Xe đối Xe:</strong> Thường dẫn đến hòa cờ nếu không có lợi thế về vị trí.</li>
  <li><strong>Mã đối Sĩ:</strong> Mã có thể thắng Sĩ nếu biết cách chơi.</li>
  <li><strong>Pháo đối Sĩ:</strong> Pháo có lợi thế trong thế cờ này.</li>
  <li><strong>Đơn Mã đối Đơn Sĩ:</strong> Một thế cờ tàn kinh điển.</li>
</ul>

<h2>Lời khuyên</h2>
<p>Để cải thiện kỹ năng cờ tàn, hãy:</p>
<ul>
  <li>Luyện tập các thế cờ tàn cơ bản thường xuyên.</li>
  <li>Học từ các ván cờ của những kỳ thủ chuyên nghiệp.</li>
  <li>Phân tích các ván cờ tàn của chính mình để tìm ra sai lầm.</li>
  <li>Kiên nhẫn và không vội vàng trong cờ tàn.</li>
</ul>

<h2>Kết luận</h2>
<p>Kỹ thuật cờ tàn là một phần quan trọng của Cờ Tướng. Hãy dành thời gian để học và luyện tập các kỹ thuật này, và bạn sẽ thấy sự cải thiện rõ rệt trong khả năng chơi cờ của mình.</p>`,
    article_type: 'Endgame',
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    meta_title: 'Kỹ thuật Cờ Tàn cơ bản - Hướng dẫn cho người mới',
    meta_description: 'Học các kỹ thuật cờ tàn cơ bản và các thế cờ phổ biến để kết thúc ván cờ một cách hiệu quả.',
    meta_keywords: ['cờ tàn', 'kỹ thuật', 'hướng dẫn', 'cờ tướng'],
  },
  {
    slug: 'cach-cai-thien-ky-nang-choi-co-tuong-hieu-qua',
    title: 'Cách cải thiện kỹ năng chơi Cờ Tướng hiệu quả',
    excerpt: 'Bí quyết và phương pháp để nâng cao trình độ chơi Cờ Tướng một cách có hệ thống và hiệu quả.',
    image_url: 'https://placehold.co/600x400/1e293b/FFF?text=Xiangqi+Strategy',
    content: `<h2>Luyện tập thường xuyên</h2>
<p>Không có cách nào tốt hơn để cải thiện kỹ năng chơi cờ bằng việc luyện tập thường xuyên. Hãy chơi ít nhất 2-3 ván cờ mỗi ngày để duy trì và nâng cao trình độ.</p>

<h2>Học từ các ván cờ kinh điển</h2>
<p>Nghiên cứu các ván cờ của những kỳ thủ vĩ đại là cách tuyệt vời để học hỏi. Bạn sẽ học được:</p>
<ul>
  <li>Các thế khai cuộc hiệu quả</li>
  <li>Chiến thuật trong trung cuộc</li>
  <li>Kỹ thuật cờ tàn</li>
  <li>Cách tư duy chiến lược</li>
</ul>

<h2>Phân tích các ván cờ của chính mình</h2>
<p>Sau mỗi ván cờ, hãy dành thời gian để phân tích lại. Tìm ra:</p>
<ul>
  <li>Những nước đi tốt và tại sao chúng tốt</li>
  <li>Những nước đi sai và cách cải thiện</li>
  <li>Các cơ hội bị bỏ lỡ</li>
  <li>Những thế cờ có thể chơi tốt hơn</li>
</ul>

<h2>Học các thế cờ cơ bản</h2>
<p>Nắm vững các thế khai cuộc, trung cuộc và cờ tàn cơ bản là nền tảng quan trọng. Hãy bắt đầu với:</p>
<ul>
  <li><strong>Khai cuộc:</strong> Pháo Đầu, Bình Phong Mã, Phản Cung Mã</li>
  <li><strong>Trung cuộc:</strong> Các thế tấn công và phòng thủ cơ bản</li>
  <li><strong>Cờ tàn:</strong> Đơn Mã, Đơn Xe, các thế cờ tàn phổ biến</li>
</ul>

<h2>Chơi với đối thủ mạnh hơn</h2>
<p>Chơi với những người chơi giỏi hơn bạn là cách nhanh nhất để cải thiện. Bạn sẽ học được nhiều điều từ cách họ suy nghĩ và chơi cờ.</p>

<h2>Sử dụng phần mềm và công cụ hỗ trợ</h2>
<p>Ngày nay, có nhiều phần mềm và ứng dụng có thể giúp bạn:</p>
<ul>
  <li>Phân tích ván cờ</li>
  <li>Luyện tập các thế cờ</li>
  <li>Chơi với AI để cải thiện kỹ năng</li>
  <li>Học từ cơ sở dữ liệu ván cờ</li>
</ul>

<h2>Tham gia các câu lạc bộ và giải đấu</h2>
<p>Tham gia các câu lạc bộ cờ và giải đấu sẽ giúp bạn:</p>
<ul>
  <li>Gặp gỡ những người chơi khác</li>
  <li>Học hỏi từ kinh nghiệm của người khác</li>
  <li>Đo lường trình độ của mình</li>
  <li>Động lực để cải thiện</li>
</ul>

<h2>Kiên nhẫn và kiên trì</h2>
<p>Cải thiện kỹ năng chơi cờ là một quá trình lâu dài. Đừng nản lòng khi thua cờ, mà hãy coi đó là cơ hội để học hỏi. Với sự kiên nhẫn và kiên trì, bạn chắc chắn sẽ tiến bộ.</p>

<h2>Kết luận</h2>
<p>Cải thiện kỹ năng chơi Cờ Tướng đòi hỏi sự kiên trì, luyện tập và học hỏi liên tục. Hãy áp dụng các phương pháp trên một cách có hệ thống, và bạn sẽ thấy sự tiến bộ rõ rệt trong khả năng chơi cờ của mình.</p>`,
    article_type: 'Guide',
    published_at: new Date().toISOString(),
    meta_title: 'Cách cải thiện kỹ năng chơi Cờ Tướng hiệu quả',
    meta_description: 'Bí quyết và phương pháp thực tế để nâng cao trình độ chơi Cờ Tướng một cách có hệ thống.',
    meta_keywords: ['cải thiện', 'kỹ năng', 'luyện tập', 'cờ tướng', 'học hỏi'],
  },
];

/**
 * Create or get admin user
 */
async function createOrGetAdmin() {
  console.log('🔍 Checking for admin user...');

  // Check if user exists by email
  const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    throw listError;
  }

  const existingUser = existingUsers.users.find((u) => u.email === ADMIN_EMAIL);

  if (existingUser) {
    console.log('✅ Admin user already exists:', existingUser.id);
    
    // Update user metadata to ensure admin role
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      existingUser.id,
      {
        user_metadata: {
          role: 'admin',
          isAdmin: true,
          username: ADMIN_USERNAME,
        },
      }
    );

    if (updateError) {
      console.warn('⚠️  Warning: Could not update user metadata:', updateError.message);
    } else {
      console.log('✅ Updated admin user metadata');
    }

    return existingUser;
  }

  // Create new admin user
  console.log('📝 Creating new admin user...');
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      role: 'admin',
      isAdmin: true,
      username: ADMIN_USERNAME,
    },
  });

  if (createError) {
    console.error('❌ Error creating admin user:', createError);
    throw createError;
  }

  console.log('✅ Admin user created:', newUser.user.id);
  return newUser.user;
}

/**
 * Create or update admin profile
 */
async function createOrUpdateProfile(userId: string) {
  console.log('🔍 Checking for admin profile...');

  const { data: existingProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    console.log('✅ Profile exists, updating...');
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: ADMIN_USERNAME,
        avatar_url: ADMIN_AVATAR_URL,
        elo_rating: 9999,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      throw updateError;
    }
    console.log('✅ Profile updated');
  } else {
    console.log('📝 Creating new profile...');
    const { error: insertError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      username: ADMIN_USERNAME,
      avatar_url: ADMIN_AVATAR_URL,
      elo_rating: 9999,
      wins: 0,
      losses: 0,
      draws: 0,
      current_theme_id: 'default',
    });

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);
      throw insertError;
    }
    console.log('✅ Profile created');
  }
}

/**
 * Seed blog articles
 */
async function seedBlogArticles(authorId: string) {
  console.log('📝 Seeding blog articles...');

  let successCount = 0;
  let errorCount = 0;

  for (const article of BLOG_ARTICLES) {
    try {
      // Check if article exists
      const { data: existing } = await supabaseAdmin
        .from('blog_articles')
        .select('id')
        .eq('slug', article.slug)
        .single();

      if (existing) {
        // Update existing article
        const { error: updateError } = await supabaseAdmin
          .from('blog_articles')
          .update({
            ...article,
            author_id: authorId,
            status: 'published',
          })
          .eq('slug', article.slug);

        if (updateError) {
          console.error(`❌ Error updating article "${article.slug}":`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Updated article: ${article.title}`);
          successCount++;
        }
      } else {
        // Insert new article
        const { error: insertError } = await supabaseAdmin.from('blog_articles').insert({
          ...article,
          author_id: authorId,
          status: 'published',
        });

        if (insertError) {
          console.error(`❌ Error inserting article "${article.slug}":`, insertError);
          errorCount++;
        } else {
          console.log(`✅ Created article: ${article.title}`);
          successCount++;
        }
      }
    } catch (error: any) {
      // Handle case where article doesn't exist (single() throws error)
      if (error.code === 'PGRST116') {
        // Article doesn't exist, insert it
        const { error: insertError } = await supabaseAdmin.from('blog_articles').insert({
          ...article,
          author_id: authorId,
          status: 'published',
        });

        if (insertError) {
          console.error(`❌ Error inserting article "${article.slug}":`, insertError);
          errorCount++;
        } else {
          console.log(`✅ Created article: ${article.title}`);
          successCount++;
        }
      } else {
        console.error(`❌ Unexpected error for article "${article.slug}":`, error);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Summary: ${successCount} articles processed, ${errorCount} errors`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting database seed script...\n');

  try {
    // Step 1: Create or get admin user
    const adminUser = await createOrGetAdmin();
    console.log('');

    // Step 2: Create or update profile
    await createOrUpdateProfile(adminUser.id);
    console.log('');

    // Step 3: Seed blog articles
    await seedBlogArticles(adminUser.id);
    console.log('');

    console.log('✅ Seed script completed successfully!');
    console.log(`\n📧 Admin credentials:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`\n🔗 You can now login at: /dang-nhap`);
  } catch (error) {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

