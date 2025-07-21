// Types for email templates

export interface MusicReleaseTemplateProps {
  artistName: string;
  releaseTitle: string;
  releaseType: string;
  releaseDate: string;
  artwork: string;
  description: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  preOrderUrl: string;
}

export interface ShowAnnouncementTemplateProps {
  artistName: string;
  showTitle: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  ticketUrl: string;
  venueAddress: string;
  supportingActs: string;
  ticketPrice: string;
  ageRestriction: string;
  posterImage: string;
  description: string;
  instagramUrl: string;
  websiteUrl: string;
}

export interface MerchandiseTemplateProps {
  artistName: string;
  collectionName: string;
  description: string;
  featuredImage: string;
  shopUrl: string;
  items: {
    name: string;
    price: string;
    image?: string;
  }[];
  limitedTime: boolean;
  discountCode: string;
  discountPercent: string;
  instagramUrl: string;
  websiteUrl: string;
}

export interface ArtistPromoTemplateProps {
  artistName: string;
  mainBannerImage: string;
  artistLogoImage: string;
  promoGifImage: string;
  shopNowImage: string;
  shopUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  recordLabel: string;
}