export interface PageConfig {
  id: 'letter' | 'story' | 'wishes' | 'moments' | 'candles' | 'wish';
  title: string;
  subtitle?: string;
  badge: string;
  heading: string;
}

export interface StoryChapter {
  chapterNumber: number;
  label: string;
  imageUrl: string;
  imageAlt: string;
  backdropColor: string;
  text: string;
}

export interface WishItem {
  id: string;
  color: 'pink' | 'lavender' | 'mint' | 'yellow' | 'coral';
  text: string;
}

export interface MomentPhoto {
  id: string;
  imageUrl: string;
  caption: string;
  backdropColor: string;
}

export interface BirthdayMockData {
  recipientName: string;
  senderName: string;
  birthdayDate: string;
  audioUrl: string;
  pages: PageConfig[];
  cover: {
    dateBadge: string;
    titleLine1: string;
    recipientName: string;
    handwrittenPrefix: string;
    handwrittenHighlight: string;
    subtitle: string;
    todayBadge: string;
    ctaButtonText: string;
    dragHint: string;
  };
  letter: {
    badge: string;
    title: string;
    greeting: string;
    paragraphs: string[];
    signOff: string;
    pullHint: string;
  };
  story: {
    chapters: StoryChapter[];
    continuedText: string;
  };
  wishes: {
    imageUrl: string;
    items: WishItem[];
    ctaLabel: string;
  };
  moments: {
    marqueeTitle: string;
    dateStamp: string;
    photos: MomentPhoto[];
    stickers: string[];
    ctaLabel: string;
    printingLabel: string;
    photoCountLabel: string;
    printAgainLabel: string;
  };
  candles: {
    badge: string;
    litHeading: string;
    blownHeading: string;
    blownSubtitle: string;
    holdLabel: string;
    relightLabel: string;
    candleColors: string[];
  };
  finale: {
    age: string;
    badge: string;
    headingPrefix: string;
    recipientShortName: string;
    signOffLine1: string;
    signOffLine2: string;
    watchAgainLabel: string;
  };
}

export const mockData: BirthdayMockData = {
  recipientName: 'Le Phuong Ngoc',
  senderName: 'Xuan Nguyen',
  birthdayDate: 'NOVEMBER 14',
  // Background track stored locally in public/audio/ (falls back cleanly to Web Audio music-box synthesis if offline)
  audioUrl: '/audio/Shiki-Perfect_audio.mp3',
  pages: [
    {
      id: 'letter',
      title: 'The letter',
      badge: 'OPEN THE ENVELOPE',
      heading: 'A letter for you',
    },
    {
      id: 'story',
      title: 'Our story',
      badge: 'CHAPTER BY CHAPTER',
      heading: 'Our story',
    },
    {
      id: 'wishes',
      title: 'Wishes',
      badge: 'MAKE A WISH!!',
      heading: 'Wishes for your new year',
    },
    {
      id: 'moments',
      title: 'Moments',
      badge: 'SAY CHEESE!',
      heading: 'Your moments',
    },
    {
      id: 'candles',
      title: 'The candles',
      badge: 'MAKE A WISH',
      heading: 'Blow out the candles',
    },
    {
      id: 'wish',
      title: 'The wish',
      subtitle: 'WISH MADE',
      badge: 'WISH MADE',
      heading: 'Happy birthday',
    },
  ],
  cover: {
    dateBadge: 'NOVEMBER 14',
    titleLine1: 'Happy birthday,',
    recipientName: 'Le Phuong Ngoc',
    handwrittenPrefix: 'for being so',
    handwrittenHighlight: 'amazing',
    subtitle: '',
    todayBadge: 'Today is your day!',
    ctaButtonText: 'Open my gift',
    dragHint: 'Drag cake to spin',
  },
  letter: {
    badge: 'OPEN THE ENVELOPE',
    title: 'A letter for you',
    greeting: 'Gửi Ngọc,',
    paragraphs: [
      'Vậy là tuổi mới đã đến, một năm nay bạn cũng đã trải qua nhiều thứ, nhiều cảm xúc khác nhau, và đến hôm nay là ngày sinh nhật, là ngày đánh dấu một cột mốc mới trong cuộc đời, hy vọng bạn đã có một ngày thật ý nghĩa',
      'Cũng ít khi tui viết một đoạn thư để chúc sinh nhật ai đó, câu chữ có thể không tròn trĩnh, nhưng lời chúc đến bạn thì sẽ luôn chân thành nhé ^^',
      'Chúng ta cũng chưa có cơ hội gặp nhau lại kể từ kha khá lâu, hy vọng một dịp đẹp trời có thể gặp mặt, trò chuyện linh tinh chẳng hạn (nếu m buồn thì có thể nhắn t cafe cùng chẳng hạn :vv)',
      'Tuổi 21 của m t nghĩ là cũng đã là trọn vẹn rồi, hy vọng sang 22 tuổi ,m sẽ còn bùng nổ hơn nữa nhóe :))',
    ],
    signOff: 'Thân mến, Xuân Nguyên',
    pullHint: 'PULL UP TO READ FULL',
  },
  story: {
    chapters: [
      {
        chapterNumber: 1,
        label: 'Chapter "21"',
        imageUrl: '/images/graduate.jpg',
        imageAlt: 'Chapter 1 memory illustration',
        backdropColor: '#D7EDE4',
        text: "Chúc mừng bạn lần nữa với tấm bằng đại học xuất sắc nhé ^^",
      },
      {
        chapterNumber: 2,
        label: 'Chapter "22"',
        imageUrl: '/images/potrait.jpg',
        imageAlt: 'Chapter 2 memory illustration',
        backdropColor: '#ECE3FA',
        text: 'Bước sang tuổi mới với dự định mới, mong bạn chân cứng đá mềm,vượt mọi khó khăn để đạt được dự định của bản thân nhé !!',
      },
    ],
    continuedText: 'To be continued...',
  },
  wishes: {
    imageUrl: 'https://picsum.photos/seed/birthday-wishes/360/220',
    items: [
      { id: 'w1', color: 'pink', text: 'Mong mọi giông bão đều dừng sau cánh cửa' },
      { id: 'w2', color: 'lavender', text: 'Mong bạn ăn ngon, ngủ kỹ, cơ thể luôn tràn đầy năng lượng' },
      { id: 'w3', color: 'mint', text: 'Mong ví tiền luôn rủng rỉnh để tự do làm điều mình thích' },
      { id: 'w4', color: 'yellow', text: 'Mong luôn gặp người tử tế và tử tế với mọi người' },
      { id: 'w5', color: 'coral', text: 'Mong bạn luôn yêu thương chính mình' },
    ],
    ctaLabel: 'Make a wish again',
  },
  moments: {
    marqueeTitle: 'Photobooth',
    dateStamp: '11 · 14 · 26',
    photos: [
      {
        id: 'm1',
        imageUrl: '/images/ptb_1.jpg',
        caption: 'Xinh',
        backdropColor: '#FCE6DA',
      },
      {
        id: 'm2',
        imageUrl: '/images/ptb_2.jpg',
        caption: 'Đẹp',
        backdropColor: '#FDF0DE',
      },
      {
        id: 'm3',
        imageUrl: '/images/ptb_3.jpg',
        caption: 'Tuyệt',
        backdropColor: '#FCE4EC',
      },
      {
        id: 'm4',
        imageUrl: '/images/ptb_4.jpg',
        caption: 'Vời!',
        backdropColor: '#E8F4F2',
      },
    ],
    stickers: [
      '/stickers/shin_chan_STICKER.gif',
      '/stickers/gd.gif',
      '/stickers/capybara.gif',
      '/stickers/cat_meme.gif',
      '/stickers/cat_fight.gif',
    ],
    ctaLabel: 'Print all',
    printingLabel: 'Printing...',
    photoCountLabel: '4 photos',
    printAgainLabel: 'Print again',
  },
  candles: {
    badge: 'MAKE A WISH',
    litHeading: 'Blow out the candles',
    blownHeading: 'Wish made! Happy Birthday!',
    blownSubtitle:
      'Lorem ipsum dolor sit amet, may every wish you just made come true in your new year.',
    holdLabel: 'Hold',
    relightLabel: 'Light candles again',
    candleColors: ['#9CE0CC', '#F9DE7E', '#F79EB3', '#BFA3E8', '#F5959E'],
  },
  finale: {
    age: '22',
    badge: 'years old',
    headingPrefix: 'Happy birthday,',
    recipientShortName: 'Le Phuong Ngoc',
    signOffLine1: 'With warmest wishes,',
    signOffLine2: 'Xuan Nguyen',
    watchAgainLabel: 'Watch again',
  },
};
