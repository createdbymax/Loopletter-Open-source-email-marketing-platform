import React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Button, Img, Hr, Link, } from '@react-email/components';
export interface MusicReleaseTemplateProps {
    artistName: string;
    releaseTitle: string;
    releaseType: string;
    releaseDate: string;
    artwork?: string;
    description?: string;
    spotifyUrl?: string;
    appleMusicUrl?: string;
    youtubeUrl?: string;
    instagramUrl?: string;
    websiteUrl?: string;
    preOrderUrl?: string;
}
export interface ShowAnnouncementTemplateProps {
    artistName: string;
    showTitle?: string;
    venue: string;
    city: string;
    date: string;
    time?: string;
    ticketUrl?: string;
    venueAddress?: string;
    supportingActs?: string;
    ticketPrice?: string;
    ageRestriction?: string;
    posterImage?: string;
    description?: string;
    instagramUrl?: string;
    websiteUrl?: string;
}
export interface MerchandiseTemplateProps {
    artistName: string;
    collectionName: string;
    description?: string;
    featuredImage?: string;
    shopUrl: string;
    items?: Array<{
        name: string;
        price: string;
        image?: string;
    }>;
    limitedTime?: boolean;
    discountCode?: string;
    discountPercent?: string;
    instagramUrl?: string;
    websiteUrl?: string;
}
interface MusicReleaseProps {
    artistName: string;
    releaseTitle: string;
    releaseType: string;
    releaseDate: string;
    coverArtUrl?: string;
    streamingLinks?: {
        spotify?: string;
        apple?: string;
        youtube?: string;
    };
    artistMessage?: string;
    unsubscribe_url?: string;
}
export function MusicReleaseTemplate(props: MusicReleaseProps) {
    const { artistName = 'Artist Name', releaseTitle = 'New Release', releaseType = 'Single', releaseDate = 'Today', coverArtUrl, streamingLinks = {}, artistMessage = 'Check out my latest release!', unsubscribe_url = '#', } = props;
    return (<Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          <Section style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Heading style={{ color: '#333333', fontSize: '28px', marginBottom: '20px' }}>
              🎵 New {releaseType} from {artistName}
            </Heading>
            
            {coverArtUrl && (<Img src={coverArtUrl} alt={`${releaseTitle} cover art`} width="300" height="300" style={{ borderRadius: '8px', marginBottom: '20px' }}/>)}
            
            <Heading style={{ color: '#333333', fontSize: '24px', marginBottom: '10px' }}>
              "{releaseTitle}"
            </Heading>
            
            <Text style={{ color: '#666666', fontSize: '16px', marginBottom: '20px' }}>
              Released {releaseDate}
            </Text>
            
            <Text style={{ color: '#333333', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              {artistMessage}
            </Text>
            
            <Section style={{ marginBottom: '30px' }}>
              <Text style={{ color: '#333333', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                Listen Now:
              </Text>
              
              {streamingLinks.spotify && (<Button href={streamingLinks.spotify} style={{
                backgroundColor: '#1DB954',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
                margin: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
            }}>
                  🎵 Spotify
                </Button>)}
              
              {streamingLinks.apple && (<Button href={streamingLinks.apple} style={{
                backgroundColor: '#FA243C',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
                margin: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
            }}>
                  🍎 Apple Music
                </Button>)}
              
              {streamingLinks.youtube && (<Button href={streamingLinks.youtube} style={{
                backgroundColor: '#FF0000',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                display: 'inline-block',
                margin: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
            }}>
                  📺 YouTube
                </Button>)}
            </Section>
            
            <Hr style={{ borderColor: '#e6e6e6', margin: '30px 0' }}/>
            
            <Text style={{ color: '#999999', fontSize: '12px' }}>
              You're receiving this because you subscribed to {artistName}'s mailing list.
              <br />
              <Link href={unsubscribe_url} style={{ color: '#999999' }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>);
}
interface ShowAnnouncementProps {
    artistName: string;
    venue: string;
    city: string;
    date: string;
    time: string;
    ticketUrl?: string;
    eventImageUrl?: string;
    supportingActs?: string[];
    ticketPrice?: string;
    unsubscribe_url?: string;
}
export function ShowAnnouncementTemplate(props: ShowAnnouncementProps) {
    const { artistName = 'Artist Name', venue = 'Venue Name', city = 'City', date = 'Date', time = 'Time', ticketUrl, eventImageUrl, supportingActs = [], ticketPrice, unsubscribe_url = '#', } = props;
    return (<Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          <Section style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Heading style={{ color: '#333333', fontSize: '28px', marginBottom: '20px' }}>
              🎤 {artistName} Live in {city}
            </Heading>
            
            {eventImageUrl && (<Img src={eventImageUrl} alt={`${artistName} live show`} width="500" height="300" style={{ borderRadius: '8px', marginBottom: '20px', maxWidth: '100%' }}/>)}
            
            <Section style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <Heading style={{ color: '#333333', fontSize: '24px', marginBottom: '15px' }}>
                {venue}
              </Heading>
              <Text style={{ color: '#666666', fontSize: '18px', marginBottom: '10px' }}>
                📅 {date} at {time}
              </Text>
              <Text style={{ color: '#666666', fontSize: '16px' }}>
                📍 {city}
              </Text>
            </Section>
            
            {supportingActs.length > 0 && (<Section style={{ marginBottom: '20px' }}>
                <Text style={{ color: '#333333', fontSize: '16px', fontWeight: 'bold' }}>
                  Special Guests:
                </Text>
                <Text style={{ color: '#666666', fontSize: '14px' }}>
                  {supportingActs.join(', ')}
                </Text>
              </Section>)}
            
            {ticketUrl && (<Section style={{ marginBottom: '30px' }}>
                <Button href={ticketUrl} style={{
                backgroundColor: '#FF6B35',
                color: '#ffffff',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: 'bold',
            }}>
                  🎫 Get Tickets {ticketPrice && `- ${ticketPrice}`}
                </Button>
              </Section>)}
            
            <Text style={{ color: '#333333', fontSize: '16px', lineHeight: '1.6' }}>
              Don't miss this incredible live performance! See you there! 🎶
            </Text>
            
            <Hr style={{ borderColor: '#e6e6e6', margin: '30px 0' }}/>
            
            <Text style={{ color: '#999999', fontSize: '12px' }}>
              You're receiving this because you subscribed to {artistName}'s mailing list.
              <br />
              <Link href={unsubscribe_url} style={{ color: '#999999' }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>);
}
interface MerchandiseProps {
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
    unsubscribe_url?: string;
}
export function MerchandiseTemplate(props: MerchandiseProps) {
    const { artistName = 'Artist Name', collectionName = 'New Collection', items = [], shopUrl, discountCode, discountPercent, unsubscribe_url = '#', } = props;
    return (<Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          <Section style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Heading style={{ color: '#333333', fontSize: '28px', marginBottom: '20px' }}>
              🛍️ New {artistName} Merch Drop
            </Heading>
            
            <Heading style={{ color: '#333333', fontSize: '24px', marginBottom: '20px' }}>
              {collectionName}
            </Heading>
            
            {discountCode && (<Section style={{
                backgroundColor: '#FFE066',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px',
                border: '2px dashed #FFD700'
            }}>
                <Text style={{ color: '#333333', fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
                  🎉 {discountPercent}% OFF with code: {discountCode}
                </Text>
              </Section>)}
            
            <Section style={{ marginBottom: '30px' }}>
              {items.map((item, index) => (<Section key={index} style={{
                display: 'inline-block',
                width: '45%',
                margin: '10px',
                verticalAlign: 'top',
                textAlign: 'center'
            }}>
                  {item.imageUrl && (<Img src={item.imageUrl} alt={item.name} width="200" height="200" style={{ borderRadius: '8px', marginBottom: '10px' }}/>)}
                  <Text style={{ color: '#333333', fontSize: '16px', fontWeight: 'bold', margin: '5px 0' }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: '#666666', fontSize: '14px', margin: '5px 0' }}>
                    {item.price}
                  </Text>
                  {item.url && (<Button href={item.url} style={{
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    fontSize: '12px',
                    marginTop: '5px',
                }}>
                      Shop Now
                    </Button>)}
                </Section>))}
            </Section>
            
            {shopUrl && (<Section style={{ marginBottom: '30px' }}>
                <Button href={shopUrl} style={{
                backgroundColor: '#8B5CF6',
                color: '#ffffff',
                padding: '15px 30px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: 'bold',
            }}>
                  🛒 Shop Full Collection
                </Button>
              </Section>)}
            
            <Text style={{ color: '#333333', fontSize: '16px', lineHeight: '1.6' }}>
              Limited quantities available. Get yours before they're gone! 🔥
            </Text>
            
            <Hr style={{ borderColor: '#e6e6e6', margin: '30px 0' }}/>
            
            <Text style={{ color: '#999999', fontSize: '12px' }}>
              You're receiving this because you subscribed to {artistName}&apos;s mailing list.
              <br />
              <Link href={unsubscribe_url} style={{ color: '#999999' }}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>);
}
