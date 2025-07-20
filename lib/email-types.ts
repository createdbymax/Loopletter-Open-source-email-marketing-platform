// Types for email templates

export interface MusicReleaseTemplateProps {
  artistName: string;
  releaseTitle: string;
  releaseType: string;
  releaseDate: string;
  coverArtUrl?: string;
  streamingLinks: {
    spotify?: string;
    apple?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  artistMessage: string;
  unsubscribe_url: string;
}

export interface ShowAnnouncementTemplateProps {
  artistName: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  ticketUrl?: string;
  eventImageUrl?: string;
  supportingActs: string[];
  ticketPrice?: string;
  unsubscribe_url: string;
}

export interface MerchandiseTemplateProps {
  artistName: string;
  collectionName: string;
  items: Array<{
    name: string;
    price: string;
    imageUrl?: string;
    url?: string;
  }>;
  shopUrl?: string;
  discountCode?: string;
  discountPercent?: number;
  unsubscribe_url: string;
}

export interface EmailContent {
  html: string;
  text: string;
}

export interface TemplateData {
  templateName?: string;
  artistName?: string;
  // Music release template fields
  releaseTitle?: string;
  releaseType?: string;
  releaseDate?: string;
  artwork?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  description?: string;
  // Show announcement template fields
  venue?: string;
  city?: string;
  date?: string;
  time?: string;
  ticketUrl?: string;
  posterImage?: string;
  supportingActs?: string;
  ticketPrice?: string;
  // Merchandise template fields
  collectionName?: string;
  items?: Array<{
    name: string;
    price: string;
    image?: string;
  }>;
  shopUrl?: string;
  discountCode?: string;
  discountPercent?: string;
  [key: string]: any;
}