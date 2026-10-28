import { Course, Instructor, Student, Enrollment, Review, ChefQuestion } from '../types';

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'chef-phan-duc-dong',
    name: 'Phan Đức Đông',
    title: '15 Năm kinh nghiệm làm bếp và thực chiến kinh doanh',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    specialty: 'Lươn Xứ Nghệ, bánh canh cá lóc, các món nhậu mở quán',
    bio: 'Chuyên gia Món Việt đặc biệt nổi tiếng với món Lươn Xứ Nghệ & Tư vấn Mở quán với hơn 10 năm kinh nghiệm Bếp và mở quán Kinh Doanh. Tận tâm truyền lửa đam mê ẩm thực truyền thống.',
    courseCount: 8,
    studentCount: 9400,
    rating: 4.9,
    phone: '0988409798',
    zalo: '0988409798',
    badge: 'Chuyên gia Lươn Xứ Nghệ',
    username: 'chefdong',
    password: '123456',
    email: 'dong@hocmonngon.vn'
  },
  {
    id: 'chef-nguyen-van-tuan',
    name: 'Chef Nguyễn Văn Tuấn',
    title: '15+ năm kinh nghiệm Bếp trưởng, cố vấn 80+ quán ăn thành công',
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    specialty: 'Bí quyết Phở Bò Hà Nội, Bún Bò Huế, Cơm Tấm Sài Gòn',
    bio: 'Chef Tuấn từng là Bếp trưởng điều hành tại các hệ thống nhà hàng ẩm thực Việt Nam cao cấp. Với tâm huyết lan tỏa giá trị món phở truyền thống ra thế giới và hỗ trợ các chủ quán khởi nghiệp kinh doanh ẩm thực thành công, anh đã trực tiếp đào tạo hơn 3,500 học viên từ khắp mọi miền đất nước.',
    courseCount: 5,
    studentCount: 3500,
    rating: 4.9,
    phone: '0912345678',
    zalo: '0912345678',
    badge: 'Bếp Trưởng 15 Năm Kinh Nghiệm',
    username: 'cheftuan',
    password: '123456',
    email: 'tuan@hocmonngon.vn'
  },
  {
    id: 'chef-nguyen-tat-thang',
    name: 'Nguyễn Tất Thắng',
    title: 'Cựu Bếp trưởng KS Phương Đông - Vinh, gần 1M followers',
    avatar: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80',
    specialty: 'Món Việt Truyền Thống, Bánh Âu Nghệ Thuật & Croissant',
    bio: 'Từng là bếp trưởng KS Phương Đông – Vinh. Nổi tiếng với gần 1tr người theo dõi. Chuyên gia trong các món ăn mang đậm bản sắc Việt kết hợp kỹ thuật âu chuẩn xác.',
    courseCount: 7,
    studentCount: 6800,
    rating: 4.9,
    phone: '0977123456',
    zalo: '0977123456',
    badge: 'Món Việt Truyền Thống & Bánh',
    username: 'chefthang',
    password: '123456',
    email: 'thang@hocmonngon.vn'
  },
  {
    id: 'chef-nguyen-thi-hong',
    name: 'Nguyễn Thị Hồng',
    title: 'Chủ chuỗi Online đồ ăn vặt & đồ uống trăm triệu/tháng',
    avatar: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80',
    specialty: 'Ăn Vặt, Đồ Uống Trào Lưu & Dimsum Hồng Kông',
    bio: 'Chủ cửa hàng Online bán đồ ăn vặt và đồ uống với doanh thu có trăm triệu/tháng. Nổi tiếng với món trứng nướng và đồ uống thay đổi theo mùa siêu hút khách.',
    courseCount: 8,
    studentCount: 7200,
    rating: 4.8,
    phone: '0966789012',
    zalo: '0966789012',
    badge: 'Ăn Vặt & Đồ Uống',
    username: 'chefhong',
    password: '123456',
    email: 'hong@hocmonngon.vn'
  },
  {
    id: 'chef-le-hoang-long',
    name: 'Chef Lê Hoàng Long',
    title: 'Chuyên gia Nước Lẩu Độc Quyền & Món Á Thượng Hạng',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    specialty: 'Dimsum, Há Cảo Tôm, Lẩu & Món Nước Châu Á',
    bio: 'Nhiều năm tu nghiệp ẩm thực Quảng Đông & Tứ Xuyên. Bậc thầy tạo hương vị nước lẩu ngọt thanh từ tủy và củ quả tự nhiên, công thức sốt nhúng độc quyền cho hơn 40 nhà hàng lẩu.',
    courseCount: 6,
    studentCount: 4300,
    rating: 4.9,
    phone: '0933221144',
    zalo: '0933221144',
    badge: 'Masterclass Nước Lẩu & Á Vị'
  },
  {
    id: 'chef-tran-thu-ha',
    name: 'Chef Trần Thu Hà',
    title: 'Nghệ nhân Bánh Pháp & Bento Cake phong cách Hàn Quốc',
    avatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
    specialty: 'Bánh Bento kem cheese, Bánh mì hoa cúc, Croissant',
    bio: 'Tốt nghiệp học viện làm bánh Cordon Bleu Paris. Chuyên gia đào tạo hơn 4,000 học viên kinh doanh tiệm bánh nhỏ và bán online thành công vượt bậc.',
    courseCount: 5,
    studentCount: 5100,
    rating: 4.9,
    phone: '0944556677',
    zalo: '0944556677',
    badge: 'Chuyên Gia Làm Bánh'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-pho-bo-truyen-thong',
    title: 'Bí Quyết Nấu Phở Bò Truyền Thống Mở Quán - Chef Nguyễn Văn Tuấn',
    slug: 'pho-bo-truyen-thong-mo-quan',
    instructorId: 'chef-nguyen-van-tuan',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    instructorAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    category: 'Mở quán kinh doanh',
    tag: 'Bán chạy',
    shortDescription: 'Làm chủ công thức chuẩn vị phở bò Hà Nội mở quán kinh doanh. Bí quyết nước dùng trong veo, ngọt thanh tự nhiên từ xương tủy không dùng mì chính.',
    description: 'Khóa học cung cấp trọn bộ bí quyết từ chọn xương ống, xử lý mùi hoi của bò, kỹ thuật nướng gừng hành quế hồi thảo quả chuẩn độ, định lượng nước mắm muối đường phèn theo gram chính xác tuyệt đối, đến bảng tính giá vốn Excel và quy trình ra món 45s.',
    thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ', // Demonstration cooking video
    originalPrice: 1800000,
    discountPrice: 1290000,
    level: 'Mở quán kinh doanh',
    durationHours: 4.5,
    rating: 4.9,
    reviewCount: 1280,
    studentCount: 3450,
    pdfRecipeUrl: 'https://drive.google.com/file/d/example-pho-bo-cong-thuc/view',
    excelCostSheetUrl: 'https://docs.google.com/spreadsheets/d/example-bang-tinh-gia-von-pho/view',
    zaloGroupLink: 'https://zalo.me/g/hocmonngon-phobo-chef-tuan',
    benefits: [
      {
        icon: 'droplets',
        title: 'Nấu nước dùng trong ngọt không mì chính',
        description: 'Bí quyết chọn xương ống, xương cục và ninh hầm đúng nhiệt độ để lấy độ ngọt tự nhiên từ tủy.'
      },
      {
        icon: 'utensils',
        title: 'Tự làm tương ớt & tương đen gia truyền',
        description: 'Công thức pha chế gia vị chấm đặc trưng miền Bắc giúp tăng hương vị đậm đà cho tô phở.'
      },
      {
        icon: 'zap',
        title: 'Quy trình ra món 45s',
        description: 'Tối ưu hóa không gian quầy bếp, sắp xếp vị trí nguyên liệu để phục vụ khách hàng nhanh chóng giờ cao điểm.'
      },
      {
        icon: 'calculator',
        title: 'Quản lý chi phí nguyên liệu',
        description: 'Cách tính giá cost chi tiết từng tô phở, kiểm soát hao hụt và tối ưu hóa lợi nhuận kinh doanh quán ăn.'
      }
    ],
    inclusions: [
      '18 video bài học Full HD trọn đời',
      'File PDF công thức gram chuẩn cho 50 - 200 bát',
      'Bảng tính giá vốn nguyên liệu Excel tự động',
      'Nhóm Zalo hỗ trợ 1-1 cùng Chef Tuấn',
      'Cam kết hoàn tiền 100% trong 7 ngày'
    ],
    chapters: [
      {
        id: 'chap-1',
        courseId: 'course-pho-bo-truyen-thong',
        title: 'Chương 1: Chọn nguyên liệu & sơ chế xương (4 bài)',
        order: 1,
        lessons: [
          {
            id: 'les-1',
            chapterId: 'chap-1',
            title: 'Bài 1: Bí quyết chọn xương ống và xương cục ngon',
            durationMinutes: 18,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-pho-nguyen-lieu',
            recipeText: 'Tỷ lệ xương chuẩn: 70% xương ống bò tươi lấy trong buổi sáng sớm, 30% xương bay hoặc xương đuôi để tạo độ keo béo thơm tự nhiên. Tránh chọn xương đông lạnh đã biến đổi sắc tố.',
            order: 1
          },
          {
            id: 'les-2',
            chapterId: 'chap-1',
            title: 'Bài 2: Kỹ thuật khử mùi hôi xương bằng gừng và rượu',
            durationMinutes: 15,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-pho-khu-mui',
            recipeText: 'Ngâm xương trong nước muối loãng 30 phút. Trần qua nước sôi có gừng đập dập và rượu Mai Quế Lộ trong 5 phút. Vớt ra rửa sạch từng khớp xương bằng nước ấm.',
            order: 2
          },
          {
            id: 'les-3',
            chapterId: 'chap-1',
            title: 'Bài 3: Lựa chọn thịt bò tái, nạm, gầu tươi ngon',
            durationMinutes: 20,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-pho-thit-bo',
            recipeText: 'Cách nhận biết thịt bò ta bánh chè mềm ngọt, thớ thịt nhỏ, sờ dính tay. Chọn nạm hoa có vân mỡ xen kẽ để khi luộc thái miếng giòn mềm không bị xác.',
            order: 3
          },
          {
            id: 'les-4',
            chapterId: 'chap-1',
            title: 'Bài 4: Sơ chế các loại rau thơm, hành hoa và chanh ớt',
            durationMinutes: 12,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-pho-rau-thom',
            recipeText: 'Hành hoa chẻ cọng, ngò gai thái nhỏ 2mm, húng láng để ráo nước. Ớt chỉ thiên thái lát ngâm dấm tỏi bí truyền.',
            order: 4
          }
        ]
      },
      {
        id: 'chap-2',
        courseId: 'course-pho-bo-truyen-thong',
        title: 'Chương 2: Kỹ thuật ninh nước dùng & hương liệu (5 bài)',
        order: 2,
        lessons: [
          {
            id: 'les-5',
            chapterId: 'chap-2',
            title: 'Bài 5: Bí quyết rang thảo mộc (quế, hồi, thảo quả) chuẩn vị',
            durationMinutes: 22,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-thao-moc',
            recipeText: 'Nướng quế thanh, hoa hồi, thảo quả đập dập, hạt mùi và rễ ngò trên than hồng hoặc chảo gang nhỏ lửa cho đến khi dậy mùi thơm tinh dầu nức mũi.',
            order: 5
          },
          {
            id: 'les-6',
            chapterId: 'chap-2',
            title: 'Bài 6: Quy trình ninh nước dùng 12 tiếng không bị đục',
            durationMinutes: 35,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://drive.google.com/file/d/sample-ninh-nuoc-dung',
            recipeText: 'Sau khi đun sôi bùng, hạ lửa riu riu ở 92-95 độ C. Không đậy kín nắp vung. Vớt bọt thường xuyên trong 2 giờ đầu tiên.',
            order: 6
          },
          {
            id: 'les-7',
            chapterId: 'chap-2',
            title: 'Bài 7: Định lượng gia vị nước mắm, muối, đường phèn',
            durationMinutes: 18,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 7
          },
          {
            id: 'les-8',
            chapterId: 'chap-2',
            title: 'Bài 8: Xử lý vị ngọt thanh tự nhiên mà không dùng mì chính',
            durationMinutes: 25,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 8
          },
          {
            id: 'les-9',
            chapterId: 'chap-2',
            title: 'Bài 9: Duy trì nhiệt độ nước dùng suốt cả ngày bán hàng',
            durationMinutes: 20,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 9
          }
        ]
      },
      {
        id: 'chap-3',
        courseId: 'course-pho-bo-truyen-thong',
        title: 'Chương 3: Chuẩn bị thịt nạm gầu & nấu sốt (5 bài)',
        order: 3,
        lessons: [
          {
            id: 'les-10',
            chapterId: 'chap-3',
            title: 'Bài 10: Kỹ thuật luộc và thái nạm bò mỏng đều đẹp mắt',
            durationMinutes: 20,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 10
          },
          {
            id: 'les-11',
            chapterId: 'chap-3',
            title: 'Bài 11: Chế biến gầu giòn sần sật không bị khô cứng',
            durationMinutes: 25,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 11
          },
          {
            id: 'les-12',
            chapterId: 'chap-3',
            title: 'Bài 12: Đập và ướp thịt bò tái đúng điệu phở truyền thống',
            durationMinutes: 15,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 12
          },
          {
            id: 'les-13',
            chapterId: 'chap-3',
            title: 'Bài 13: Công thức pha chế tương ớt gia truyền',
            durationMinutes: 20,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 13
          },
          {
            id: 'les-14',
            chapterId: 'chap-3',
            title: 'Bài 14: Làm tương đen đặc sản ăn kèm phở bò',
            durationMinutes: 18,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 14
          }
        ]
      },
      {
        id: 'chap-4',
        courseId: 'course-pho-bo-truyen-thong',
        title: 'Chương 4: Tính giá cost & quy trình mở quán (4 bài)',
        order: 4,
        lessons: [
          {
            id: 'les-15',
            chapterId: 'chap-4',
            title: 'Bài 15: Hướng dẫn sử dụng file Excel tính giá vốn nguyên liệu 1 tô phở',
            durationMinutes: 30,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            recipeDocumentUrl: 'https://docs.google.com/spreadsheets/d/sample-cost-pho',
            order: 15
          },
          {
            id: 'les-16',
            chapterId: 'chap-4',
            title: 'Bài 16: Setup khu vực ra món 45 giây tối ưu nhân sự',
            durationMinutes: 25,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 16
          },
          {
            id: 'les-17',
            chapterId: 'chap-4',
            title: 'Bài 17: Chiến lược định giá bán và thu hút khách hàng ngày khai trương',
            durationMinutes: 28,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 17
          },
          {
            id: 'les-18',
            chapterId: 'chap-4',
            title: 'Bài 18: Kinh nghiệm xử lý sự cố vận hành quán ăn thực tế',
            durationMinutes: 22,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 18
          }
        ]
      }
    ]
  },
  {
    id: 'course-sup-luon-xu-nghe',
    title: 'Bí Quyết Súp Lươn Xứ Nghệ Mở Quán - Chef Phan Đức Đông',
    slug: 'sup-luon-xu-nghe-mo-quan',
    instructorId: 'chef-phan-duc-dong',
    instructorName: 'Phan Đức Đông',
    instructorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    category: 'Lươn Xứ Nghệ',
    tag: 'Bán chạy',
    shortDescription: 'Làm chủ công thức chuẩn vị lươn xứ Nghệ 4 món: Súp lươn, cháo lươn, miến lươn xào và miến lươn nước giòn rụm.',
    description: 'Chuyên gia Phan Đức Đông hướng dẫn từ cách chọn lươn đồng béo vàng, kỹ thuật tuốt lươn không tanh, gia vị cay nồng ớt cay Vinh kết hợp tiêu sọ và nghệ nếp.',
    thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/fW83QvUv7-o',
    originalPrice: 1200000,
    discountPrice: 599000,
    level: 'Cơ bản & Nâng cao',
    durationHours: 3.5,
    rating: 4.9,
    reviewCount: 940,
    studentCount: 2800,
    inclusions: [
      '12 video bài học chi tiết',
      'Công thức gia vị ướp lươn độc quyền',
      'Tài liệu PDF tính cost món ăn',
      'Hỗ trợ Zalo trực tiếp cùng thầy Đông'
    ],
    benefits: [
      {
        icon: 'flame',
        title: 'Khử tanh lươn đồng 100%',
        description: 'Bí quyết dùng tro bếp hoặc muối chanh giúp lươn sạch nhớt, thịt săn chắc ngọt đậm.'
      },
      {
        icon: 'sparkles',
        title: 'Màu nghệ vàng óng tự nhiên',
        description: 'Tự chưng dầu điều và nước cốt nghệ tươi giữ màu sánh óng hấp dẫn.'
      }
    ],
    chapters: [
      {
        id: 'chap-luon-1',
        courseId: 'course-sup-luon-xu-nghe',
        title: 'Phần 1: Sơ chế lươn & Nấu nước dùng xương lươn',
        order: 1,
        lessons: [
          {
            id: 'les-luon-1',
            chapterId: 'chap-luon-1',
            title: 'Bài 1: Cách chọn lươn đồng và sơ chế sạch nhớt',
            durationMinutes: 16,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/fW83QvUv7-o',
            order: 1
          },
          {
            id: 'les-luon-2',
            chapterId: 'chap-luon-1',
            title: 'Bài 2: Luộc và lóc thịt lươn bằng cật tre',
            durationMinutes: 18,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/fW83QvUv7-o',
            order: 2
          },
          {
            id: 'les-luon-3',
            chapterId: 'chap-luon-1',
            title: 'Bài 3: Hầm xương lươn lấy nước dùng ngọt thanh',
            durationMinutes: 22,
            isFreeTrial: false,
            videoUrl: 'https://www.youtube.com/embed/fW83QvUv7-o',
            order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'course-bun-bo-hue',
    title: 'Bún Bò Huế Chuẩn Vị Cố Đô',
    slug: 'bun-bo-hue-chuan-vi-co-do',
    instructorId: 'chef-nguyen-van-tuan',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    instructorAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    category: 'Mở quán kinh doanh',
    tag: 'Bán chạy',
    shortDescription: 'Học cách kết hợp sả, mắm ruốc chuẩn Huế và kỹ thuật hầm giò heo giòn sần sật không bị nát.',
    description: 'Bí quyết nước dùng bún bò Huế đậm đà thơm ngát mùi sả và ruốc Huế phi thơm, ớt sa tế cay tê tái, chả cua giòn ngọt cùng giò heo rút xương.',
    thumbnail: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 999000,
    discountPrice: 499000,
    level: 'Trung cấp',
    durationHours: 2.8,
    rating: 4.9,
    reviewCount: 780,
    studentCount: 2150,
    inclusions: ['18 bài học thực chiến', 'Công thức mắm ruốc chưng', 'Hỗ trợ mở quán'],
    benefits: [],
    chapters: [
      {
        id: 'chap-bbh-1',
        courseId: 'course-bun-bo-hue',
        title: 'Chương 1: Xử lý nguyên liệu & Nước lèo chuẩn vị Huế',
        order: 1,
        lessons: [
          {
            id: 'les-bbh-1',
            chapterId: 'chap-bbh-1',
            title: 'Bài 1: Kỹ thuật chọn và nướng sả cây, thơm hành tím',
            durationMinutes: 15,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          },
          {
            id: 'les-bbh-2',
            chapterId: 'chap-bbh-1',
            title: 'Bài 2: Cách lọc mắm ruốc Huế không bị cặn và nồng mùi',
            durationMinutes: 20,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'course-com-tam-suon-nuong',
    title: 'Cơm Tấm Sườn Nướng Sài Gòn',
    slug: 'com-tam-suon-nuong-sai-gon',
    instructorId: 'chef-nguyen-van-tuan',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    instructorAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    category: 'Mở quán kinh doanh',
    tag: 'Khóa mới',
    shortDescription: 'Công thức ướp sườn mềm mọng nước, nướng lửa than thơm lừng và pha nước mắm tỏi ớt kẹo sệt chuẩn vị miền Nam.',
    description: 'Chỉ cần một công thức chuẩn, bạn có thể tự tin mở quán cơm tấm sườn bì chả đắt khách mỗi ngày.',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 799000,
    discountPrice: 399000,
    level: 'Cơ bản',
    durationHours: 2.0,
    rating: 4.8,
    reviewCount: 420,
    studentCount: 1650,
    inclusions: ['15 bài học video', 'Công thức sốt ướp sườn', 'Cách hấp chả trứng vàng ươm'],
    benefits: [],
    chapters: [
      {
        id: 'chap-ct-1',
        courseId: 'course-com-tam-suon-nuong',
        title: 'Chương 1: Kỹ thuật ướp & Nướng sườn mọng nước',
        order: 1,
        lessons: [
          {
            id: 'les-ct-1',
            chapterId: 'chap-ct-1',
            title: 'Bài 1: Tỷ lệ gia vị ướp sườn cốt lết thấm mềm',
            durationMinutes: 18,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-croissant-ngan-lop',
    title: 'Croissant Ngàn Lớp Chuẩn Pháp',
    slug: 'croissant-ngan-lop-chuan-phap',
    instructorId: 'chef-nguyen-tat-thang',
    instructorName: 'Chef Nguyễn Tất Thắng',
    instructorAvatar: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=400&q=80',
    category: 'Bánh Canh',
    tag: 'Có học thử',
    shortDescription: 'Kỹ thuật cán bơ nhiều lớp (laminated dough) tạo vân bánh tổ ong hoàn hảo và giòn tan khó cưỡng.',
    description: 'Làm chủ bí quyết kiểm soát nhiệt độ bơ Pháp, kỹ thuật gấp cán 3x3 và căn chỉnh độ nở của men bột bánh.',
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 1400000,
    discountPrice: 699000,
    level: 'Nâng cao',
    durationHours: 4.0,
    rating: 4.9,
    reviewCount: 650,
    studentCount: 1950,
    inclusions: ['20 bài học', 'File PDF kiểm soát nhiệt độ lò', 'Hỗ trợ 1-1'],
    benefits: [],
    chapters: [
      {
        id: 'chap-crois-1',
        courseId: 'course-croissant-ngan-lop',
        title: 'Chương 1: Nhào bột và kỹ thuật gói bơ khối',
        order: 1,
        lessons: [
          {
            id: 'les-crois-1',
            chapterId: 'chap-crois-1',
            title: 'Bài 1: Công thức bột nhào đạt màng gluten hoàn hảo',
            durationMinutes: 20,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-banh-bento-kem-cheese',
    title: 'Bánh Bento Kem Cheese Xu Hướng',
    slug: 'banh-bento-kem-cheese',
    instructorId: 'chef-tran-thu-ha',
    instructorName: 'Chef Trần Thu Hà',
    instructorAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
    category: 'Công thức',
    tag: 'Bán chạy',
    shortDescription: 'Cách đánh kem cheese mượt mà không chảy, kỹ thuật vẽ chữ và tạo hình decor phong cách Hàn Quốc.',
    description: 'Bộ sưu tập mẫu bánh sinh nhật mini siêu xinh, công thức cốt bánh chiffon mềm ẩm tan trong miệng.',
    thumbnail: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 899000,
    discountPrice: 449000,
    level: 'Cơ bản',
    durationHours: 2.3,
    rating: 4.9,
    reviewCount: 890,
    studentCount: 3100,
    inclusions: ['12 bài học chi tiết', 'File tổng hợp 50 mẫu decor bento hot trend'],
    benefits: [],
    chapters: [
      {
        id: 'chap-bento-1',
        courseId: 'course-banh-bento-kem-cheese',
        title: 'Chương 1: Cốt bánh chiffon & Đánh kem cheese',
        order: 1,
        lessons: [
          {
            id: 'les-bento-1',
            chapterId: 'chap-bento-1',
            title: 'Bài 1: Đánh lòng trắng trứng và nướng cốt bông lan',
            durationMinutes: 16,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-banh-mi-hoa-cuc',
    title: 'Bánh Mì Hoa Cúc Thơm Ngậy Bơ Pháp',
    slug: 'banh-mi-hoa-cuc',
    instructorId: 'chef-tran-thu-ha',
    instructorName: 'Chef Trần Thu Hà',
    instructorAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&w=400&q=80',
    category: 'Công thức',
    tag: 'Khóa mới',
    shortDescription: 'Kỹ thuật tạo thớ bánh dai mềm kéo sợi dài, thơm nức hương hoa cam và bơ tươi hảo hạng.',
    description: 'Không cần chất bảo quản hay phụ gia, tự tin làm bánh mì hoa cúc để được 5-7 ngày vẫn thơm ngon.',
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 999000,
    discountPrice: 499000,
    level: 'Trung cấp',
    durationHours: 3.0,
    rating: 4.8,
    reviewCount: 310,
    studentCount: 1420,
    inclusions: ['14 bài học', 'Công thức cân đo men tươi'],
    benefits: [],
    chapters: [
      {
        id: 'chap-hc-1',
        courseId: 'course-banh-mi-hoa-cuc',
        title: 'Chương 1: Tạo men & Nhồi bột hoa cam',
        order: 1,
        lessons: [
          {
            id: 'les-hc-1',
            chapterId: 'chap-hc-1',
            title: 'Bài 1: Bí quyết chọn bơ và tinh dầu hoa cam',
            durationMinutes: 14,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-dimsum-ha-cao',
    title: 'Dimsum & Há Cảo Tôm Trong Suốt Thượng Hạng',
    slug: 'dimsum-ha-cao-tom',
    instructorId: 'chef-le-hoang-long',
    instructorName: 'Chef Lê Hoàng Long',
    instructorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    category: 'Đồ Nhậu',
    tag: 'Có học thử',
    shortDescription: 'Kỹ thuật nhào bột vỏ há cảo trong suốt dai mỏng và phần nhân tôm giòn sần sật chuẩn vị nhà hàng 5 sao.',
    description: 'Làm chủ nghệ thuật bắt nếp múi sò dimsum kinh điển và bí quyết giữ màu tôm hồng hào căng mọng.',
    thumbnail: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 1099000,
    discountPrice: 549000,
    level: 'Trung cấp',
    durationHours: 3.2,
    rating: 4.9,
    reviewCount: 520,
    studentCount: 1840,
    inclusions: ['16 bài học', 'Kỹ thuật dùng dao miết vỏ dimsum'],
    benefits: [],
    chapters: [
      {
        id: 'chap-dim-1',
        courseId: 'course-dimsum-ha-cao',
        title: 'Chương 1: Pha bột tàng định & Xử lý tôm giòn',
        order: 1,
        lessons: [
          {
            id: 'les-dim-1',
            chapterId: 'chap-dim-1',
            title: 'Bài 1: Tỷ lệ bột tàn mì và bột năng tạo độ trong veo',
            durationMinutes: 18,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          },
          {
            id: 'les-dim-2',
            chapterId: 'chap-dim-1',
            title: 'Bài 2: Kỹ thuật ướp nhân tôm giòn sần sật',
            durationMinutes: 16,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'course-nuoc-lau-doc-quyen',
    title: 'Bộ Công Thức Nước Lẩu Độc Quyền Quán Ăn',
    slug: 'nuoc-lau-doc-quyen-quan-an',
    instructorId: 'chef-le-hoang-long',
    instructorName: 'Chef Lê Hoàng Long',
    instructorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    category: 'Mở quán kinh doanh',
    tag: 'Bán chạy',
    shortDescription: 'Công thức nước lẩu Thái, lẩu kim chi và lẩu Tứ Xuyên đậm đà, giữ chân khách hàng từ lần thử đầu tiên.',
    description: 'Cung cấp trọn vẹn 6 vị nước lẩu kinh doanh: Lẩu Thái Tomyum, Lẩu Tứ Xuyên thảo mộc, Lẩu nấm dưỡng sinh, Lẩu cua đồng, Lẩu ếch măng cay.',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 1599000,
    discountPrice: 799000,
    level: 'Nâng cao',
    durationHours: 4.5,
    rating: 4.9,
    reviewCount: 1120,
    studentCount: 3900,
    inclusions: ['22 bài học', '6 công thức cốt lẩu bảo quản 30 ngày', 'Bảng tính cost'],
    benefits: [],
    chapters: [
      {
        id: 'chap-lau-1',
        courseId: 'course-nuoc-lau-doc-quyen',
        title: 'Chương 1: Nấu cốt nước hầm & Cốt lẩu Thái Tomyum',
        order: 1,
        lessons: [
          {
            id: 'les-lau-1',
            chapterId: 'chap-lau-1',
            title: 'Bài 1: Công thức nước cốt lẩu Thái chua cay chuẩn vị',
            durationMinutes: 24,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'course-mon-nhau-sot-bbq',
    title: 'Top Món Nhậu Sốt BBQ & Nướng Mở Quán',
    slug: 'mon-nhau-sot-bbq-nuong',
    instructorId: 'chef-phan-duc-dong',
    instructorName: 'Chef Phan Đức Đông',
    instructorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    category: 'Đồ Nhậu',
    tag: 'Khóa mới',
    shortDescription: 'Hơn 20 công thức mồi nhậu độc quyền giúp tối ưu doanh thu cho các mô hình quán nhậu hiện đại.',
    description: 'Từ các loại sốt chấm muối ớt xanh, sốt me cay kẹo, sườn bò nướng tảng đến chân gà rút xương sốt Thái.',
    thumbnail: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    previewVideoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
    originalPrice: 799000,
    discountPrice: 399000,
    level: 'Cơ bản',
    durationHours: 2.5,
    rating: 4.8,
    reviewCount: 380,
    studentCount: 1250,
    inclusions: ['15 bài học thực chiến', 'Công thức 5 loại sốt chấm thần thánh'],
    benefits: [],
    chapters: [
      {
        id: 'chap-bbq-1',
        courseId: 'course-mon-nhau-sot-bbq',
        title: 'Chương 1: Pha chế các dòng sốt ướp thịt nướng',
        order: 1,
        lessons: [
          {
            id: 'les-bbq-1',
            chapterId: 'chap-bbq-1',
            title: 'Bài 1: Sốt BBQ mật ong ướp ba chỉ và sườn heo',
            durationMinutes: 18,
            isFreeTrial: true,
            videoUrl: 'https://www.youtube.com/embed/Pj13k8Lq0jQ',
            order: 1
          }
        ]
      }
    ]
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-minh-hoang',
    name: 'Minh Hoàng',
    email: 'minhhoang@gmail.com',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    registeredAt: '2025-10-10',
    goal: 'Mở quán phở và ẩm thực truyền thống tại Đà Nẵng'
  },
  {
    id: 'student-thu-huong',
    name: 'Thu Hương',
    email: 'thuhuong@gmail.com',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    registeredAt: '2025-11-02',
    goal: 'Nấu ăn cho gia đình và mở tiệm ăn vặt'
  },
  {
    id: 'student-quoc-nam',
    name: 'Quốc Nam',
    email: 'quocnam@gmail.com',
    phone: '0988223344',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    registeredAt: '2025-11-15',
    goal: 'Chủ quán ăn tại Hà Nội'
  },
  {
    id: 'student-hoang-anh',
    name: 'Hoàng Anh',
    email: 'hoanganh@gmail.com',
    phone: '0977665544',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    registeredAt: '2025-12-01',
    goal: 'Học thử trải nghiệm'
  },
  {
    id: 'student-thanh-mai',
    name: 'Thanh Mai',
    email: 'thanhmai@gmail.com',
    phone: '0933445566',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    registeredAt: '2025-12-10',
    goal: 'Kinh doanh tiệm bánh online'
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-1',
    studentId: 'student-minh-hoang',
    courseId: 'course-pho-bo-truyen-thong',
    courseTitle: 'Bí Quyết Nấu Phở Bò Mở Quán',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-10-12',
    type: 'paid',
    pricePaid: 1290000,
    completedLessonIds: [
      'les-1', 'les-2', 'les-3', 'les-4',
      'les-5', 'les-6', 'les-7', 'les-8',
      'les-9', 'les-10', 'les-11', 'les-12'
    ], // 12 of 18 (68%)
    lastLessonId: 'les-13',
    lastActiveAt: '2 giờ trước',
    status: 'active'
  },
  {
    id: 'enr-2',
    studentId: 'student-minh-hoang',
    courseId: 'course-croissant-ngan-lop',
    courseTitle: 'Bánh Mì Artisan & Croissant Ngàn Lớp',
    instructorName: 'Chef Thu Hà',
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-10-25',
    type: 'paid',
    pricePaid: 699000,
    completedLessonIds: ['les-crois-1', 'les-c2', 'les-c3', 'les-c4', 'les-c5', 'les-c6', 'les-c7'],
    lastLessonId: 'les-c8',
    lastActiveAt: 'hôm qua',
    status: 'active'
  },
  {
    id: 'enr-3',
    studentId: 'student-minh-hoang',
    courseId: 'course-nuoc-lau-doc-quyen',
    courseTitle: 'Bộ Công Thức Nước Lẩu Độc Quyền Quán Ăn',
    instructorName: 'Chef Long',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-09-01',
    type: 'paid',
    pricePaid: 799000,
    completedLessonIds: Array.from({ length: 22 }, (_, i) => `les-lau-${i + 1}`),
    lastActiveAt: 'Đã hoàn thành',
    status: 'completed'
  },
  {
    id: 'enr-4',
    studentId: 'student-minh-hoang',
    courseId: 'course-dimsum-ha-cao',
    courseTitle: 'Dimsum & Há Cảo Tôm Trong Suốt',
    instructorName: 'Chef Long',
    thumbnail: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-12-14',
    type: 'trial',
    pricePaid: 0,
    completedLessonIds: ['les-dim-1'],
    lastLessonId: 'les-dim-2',
    lastActiveAt: '3 giờ trước',
    trialExpiresAt: 'Còn 4 ngày 18 giờ',
    status: 'active'
  },
  {
    id: 'enr-5',
    studentId: 'student-thu-huong',
    courseId: 'course-pho-bo-truyen-thong',
    courseTitle: 'Bí Quyết Nấu Phở Bò Mở Quán',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-11-05',
    type: 'paid',
    pricePaid: 1290000,
    completedLessonIds: Array.from({ length: 18 }, (_, i) => `les-${i + 1}`),
    lastActiveAt: '3 ngày trước',
    status: 'completed'
  },
  {
    id: 'enr-6',
    studentId: 'student-quoc-nam',
    courseId: 'course-sup-luon-xu-nghe',
    courseTitle: 'Bí Quyết Súp Lươn Xứ Nghệ Mở Quán',
    instructorName: 'Phan Đức Đông',
    thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-11-18',
    type: 'paid',
    pricePaid: 599000,
    completedLessonIds: ['les-luon-1', 'les-luon-2'],
    lastLessonId: 'les-luon-3',
    lastActiveAt: '1 ngày trước',
    status: 'active'
  },
  {
    id: 'enr-7',
    studentId: 'student-hoang-anh',
    courseId: 'course-pho-bo-truyen-thong',
    courseTitle: 'Bí Quyết Nấu Phở Bò Mở Quán',
    instructorName: 'Chef Nguyễn Văn Tuấn',
    thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    enrolledAt: '2025-12-01',
    type: 'trial',
    pricePaid: 0,
    completedLessonIds: ['les-1', 'les-2'],
    lastActiveAt: '4 ngày trước',
    trialExpiresAt: 'Còn 2 ngày',
    status: 'active'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    courseId: 'course-pho-bo-truyen-thong',
    author: 'Minh Hoàng',
    role: 'Chủ quán Phở Hà Nội tại Đà Nẵng',
    rating: 5,
    comment: 'Khóa học cực kỳ chi tiết và thực tế. Nhờ công thức nước dùng và bảng tính giá cost của Chef Tuấn mà quán mình đã khai trương thuận lợi, khách khen nước dùng ngọt thanh tự nhiên rất nhiều!',
    dishImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rev-2',
    courseId: 'course-pho-bo-truyen-thong',
    author: 'Thu Hương',
    role: 'Học viên tại TP. Hồ Chí Minh',
    rating: 5,
    comment: 'Ban đầu mình cứ nghĩ nấu phở bò phức tạp lắm, nhưng Chef hướng dẫn từng li từng tí, từ cách chọn xương đến pha chế tương ớt gia truyền. Rất đáng tiền đầu tư!',
    dishImage: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'rev-3',
    courseId: 'course-pho-bo-truyen-thong',
    author: 'Quốc Nam',
    role: 'Chủ quán ăn tại Hà Nội',
    rating: 5,
    comment: 'Phần hướng dẫn setup quầy bếp 45 giây giúp quán mình phục vụ nhanh gấp đôi vào giờ cao điểm buổi sáng. Cảm ơn Chef Tuấn và đội ngũ Học Món Ngon rất nhiều.',
    dishImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80'
  }
];

export const INITIAL_QUESTIONS: ChefQuestion[] = [
  {
    id: 'q-1',
    studentId: 'student-minh-hoang',
    studentName: 'Minh Hoàng',
    studentPhone: '0901234567',
    chefName: 'Chef Nguyễn Văn Tuấn',
    question: 'Thầy ơi, nước dùng phở bò của em khi ninh qua đêm bị hơi đục nhẹ ở đáy nồi, có cách nào khắc phục mà không cần đun lại từ đầu không thầy?',
    createdAt: 'Hôm qua lúc 14:20',
    status: 'answered',
    reply: 'Chào Hoàng! Em dùng lòng trắng trứng gà đánh tan cùng ít gừng băm, đổ nhẹ vào nước dùng ở nhiệt độ 80 độ C. Lòng trắng trứng sẽ hút sạch cặn đục li ti rồi nổi lên trên, em vớt bỏ là nước dùng lại trong veo nhé!'
  }
];

export const COURSE_CATEGORIES = [
  'Tất cả',
  'Mở quán kinh doanh',
  'Lươn Xứ Nghệ',
  'Bánh Canh',
  'Đồ Nhậu',
  'Công thức'
];

export const FAQ_ITEMS = [
  {
    question: 'Chương trình học thử có thực sự hoàn toàn miễn phí không?',
    answer: 'Có! Bạn được truy cập ngay lập tức 3 bài học video chuẩn Full HD chất lượng cao, file PDF tóm tắt công thức và tham gia nhóm hỗ trợ học tập hoàn toàn không tốn bất kỳ chi phí nào.'
  },
  {
    question: 'Sau khi đăng ký bao lâu thì nhận được video bài học?',
    answer: 'Hệ thống tự động kích hoạt tài khoản ngay tức thì trong vòng 30 giây. Thông tin truy cập được hiển thị trực tiếp trên màn hình và gửi qua Zalo/Email của bạn.'
  },
  {
    question: 'Tôi có thể xem lại bài học bao nhiêu lần?',
    answer: 'Khi đăng ký khóa học trọn gói, bạn sở hữu quyền truy cập vĩnh viễn trọn đời, có thể xem lại bài giảng bất cứ lúc nào trên điện thoại, máy tính bảng hoặc laptop.'
  },
  {
    question: 'Tôi chưa từng nấu ăn bao giờ có thể tham gia được không?',
    answer: 'Các khóa học được thiết kế từ căn bản nhất, hướng dẫn chi tiết từng gram gia vị, cách cầm dao thái thịt, kiểm soát nhiệt độ lửa. Rất nhiều học viên chưa từng nấu ăn đã mở quán thành công.'
  },
  {
    question: 'Học viên có được hỗ trợ tư vấn mở quán kinh doanh ẩm thực không?',
    answer: 'Có! Bạn được tham gia nhóm Zalo kín hỗ trợ 1-1 trực tiếp cùng Bếp trưởng và đội ngũ trợ giảng, được hỗ trợ tính giá vốn (food cost), tư vấn mua sắm thiết bị bếp và chiến lược khai trương.'
  }
];
