"use client";
import Image from "next/image";
import { MusicReleaseTemplateProps, ShowAnnouncementTemplateProps, MerchandiseTemplateProps, } from "@/app/dashboard/email-templates";
interface TemplatePreviewProps {
    templateId: string;
    templateData: MusicReleaseTemplateProps | ShowAnnouncementTemplateProps | MerchandiseTemplateProps;
}
export function TemplatePreview({ templateId, templateData, }: TemplatePreviewProps) {
    const renderTemplate = () => {
        switch (templateId) {
            case "music-release":
                return (<MusicReleasePreview data={templateData as MusicReleaseTemplateProps}/>);
            case "show-announcement":
                return (<ShowAnnouncementPreview data={templateData as ShowAnnouncementTemplateProps}/>);
            case "merchandise":
                return (<MerchandisePreview data={templateData as MerchandiseTemplateProps}/>);
            default:
                return <div>Template not found</div>;
        }
    };
    return (<div className="max-w-2xl mx-auto">
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        {renderTemplate()}
      </div>
    </div>);
}
function MusicReleasePreview({ data }: {
    data: MusicReleaseTemplateProps;
}) {
    return (<div className="bg-gray-50 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        
        <div className="bg-gray-800 text-white text-center py-6">
          <h1 className="text-lg font-bold tracking-wide">
            🎵 NEW MUSIC ALERT
          </h1>
        </div>

        
        {data.artwork && (<div className="text-center">
            <Image src={data.artwork} alt={`${data.releaseTitle} artwork`} width={600} height={600} className="w-full h-auto max-w-full block"/>
          </div>)}

        
        <div className="p-8">
          <div className="text-center">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
              {data.releaseType?.toUpperCase() || "SINGLE"}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {data.releaseTitle || "[Release Title]"}
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              by {data.artistName || "[Artist Name]"}
            </p>
            <p className="text-gray-600 mb-6">
              Out now • {data.releaseDate || "[Release Date]"}
            </p>
          </div>

          <hr className="border-gray-200 my-6"/>

          <p className="text-gray-700 text-base leading-relaxed mb-8">
            {data.description ||
            "[Tell your fans about this release - the inspiration, the story, what it means to you...]"}
          </p>

          
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Listen Now
            </h3>
            <div className="flex gap-3 mb-3">
              {data.spotifyUrl && (<a href={data.spotifyUrl} className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors">
                  🎧 Spotify
                </a>)}
              {data.appleMusicUrl && (<a href={data.appleMusicUrl} className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors">
                  🍎 Apple Music
                </a>)}
            </div>
            {data.youtubeUrl && (<div className="mb-3">
                <a href={data.youtubeUrl} className="block bg-red-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors">
                  📺 Watch on YouTube
                </a>
              </div>)}
            {data.preOrderUrl && (<div>
                <a href={data.preOrderUrl} className="block bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
                  💿 Pre-Order Physical
                </a>
              </div>)}
          </div>

          
          <div className="bg-gray-50 p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Stay Connected
            </h4>
            <div className="flex justify-center gap-6">
              {data.instagramUrl && (<a href={data.instagramUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  📸 Instagram
                </a>)}
              {data.websiteUrl && (<a href={data.websiteUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  🌐 Website
                </a>)}
            </div>
          </div>

          
          <div className="bg-gray-800 text-gray-300 p-6 text-center text-sm leading-relaxed">
            Thanks for being an amazing fan! ❤️
            <br />
            You&apos;re receiving this because you signed up for updates from{" "}
            {data.artistName || "[Artist Name]"}.
          </div>
        </div>
      </div>
    </div>);
}
function ShowAnnouncementPreview({ data, }: {
    data: ShowAnnouncementTemplateProps;
}) {
    return (<div className="bg-gray-50 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        
        <div className="bg-gray-800 text-white text-center py-6">
          <h1 className="text-lg font-bold tracking-wide">
            🎤 LIVE SHOW ANNOUNCEMENT
          </h1>
        </div>

        
        {data.posterImage && (<div className="text-center">
            <Image src={data.posterImage} alt={`${data.showTitle} poster`} width={600} height={400} className="w-full h-auto max-w-full block"/>
          </div>)}

        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {data.showTitle || "[Show Title]"}
            </h2>
            <p className="text-xl text-gray-600">
              {data.artistName || "[Artist Name]"}
            </p>
          </div>

          <hr className="border-gray-200 my-6"/>

          
          <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  📅 Date
                </p>
                <p className="font-semibold text-gray-900">
                  {data.date || "[Date]"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  🕐 Time
                </p>
                <p className="font-semibold text-gray-900">
                  {data.time || "[Time]"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  📍 Venue
                </p>
                <p className="font-semibold text-gray-900">
                  {data.venue || "[Venue Name]"}
                </p>
                <p className="text-sm text-gray-600">
                  {data.venueAddress || "[Venue Address]"}
                </p>
                <p className="text-sm text-gray-600">
                  {data.city || "[City, State]"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  💰 Tickets
                </p>
                <p className="font-semibold text-gray-900">
                  {data.ticketPrice || "[Ticket Price]"}
                </p>
                <p className="text-sm text-gray-600">
                  {data.ageRestriction || "All Ages"}
                </p>
              </div>
            </div>
            {data.supportingActs && (<div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  🎸 Special Guests
                </p>
                <p className="font-semibold text-gray-900">
                  {data.supportingActs}
                </p>
              </div>)}
          </div>

          <hr className="border-gray-200 my-6"/>

          <p className="text-gray-700 text-base leading-relaxed mb-8">
            {data.description ||
            "[Tell your fans why this show is special, what to expect, and why they shouldn&apos;t miss it...]"}
          </p>

          
          {data.ticketUrl && (<div className="text-center mb-8">
              <a href={data.ticketUrl} className="inline-block bg-red-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg">
                🎫 Get Tickets Now
              </a>
              <p className="text-red-600 text-sm font-semibold mt-3">
                ⚡ Limited tickets available - don&apos;t wait!
              </p>
            </div>)}

          
          <div className="bg-gray-50 p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Stay Connected
            </h4>
            <div className="flex justify-center gap-6">
              {data.instagramUrl && (<a href={data.instagramUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  📸 Instagram
                </a>)}
              {data.websiteUrl && (<a href={data.websiteUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  🌐 Website
                </a>)}
            </div>
          </div>

          
          <div className="bg-gray-800 text-gray-300 p-6 text-center text-sm leading-relaxed">
            Can&apos;t wait to see you there! 🤘
            <br />
            You&apos;re receiving this because you signed up for updates from{" "}
            {data.artistName || "[Artist Name]"}.
          </div>
        </div>
      </div>
    </div>);
}
function MerchandisePreview({ data }: {
    data: MerchandiseTemplateProps;
}) {
    return (<div className="bg-gray-50 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        
        <div className="bg-gray-800 text-white text-center py-6">
          <h1 className="text-lg font-bold tracking-wide">🛍️ NEW MERCH DROP</h1>
          {data.limitedTime && (<p className="text-yellow-400 text-sm font-semibold mt-2 uppercase tracking-wide">
              ⏰ LIMITED TIME ONLY
            </p>)}
        </div>

        
        {data.featuredImage && (<div className="text-center">
            <Image src={data.featuredImage} alt={`${data.collectionName} collection`} width={600} height={400} className="w-full h-auto max-w-full block"/>
          </div>)}

        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {data.collectionName || "[Collection Name]"}
            </h2>
            <p className="text-xl text-gray-600">
              by {data.artistName || "[Artist Name]"}
            </p>
          </div>

          <hr className="border-gray-200 my-6"/>

          <p className="text-gray-700 text-base leading-relaxed mb-8">
            {data.description ||
            "[Tell your fans about this merch drop - the design inspiration, quality, and why they&apos;ll love it...]"}
          </p>

          
          {data.discountCode && (<div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-lg p-5 text-center mb-8">
              <h3 className="text-yellow-800 text-lg font-bold mb-2">
                🎉 Special Offer
              </h3>
              <p className="text-yellow-800">
                Use code{" "}
                <strong className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-mono">
                  {data.discountCode}
                </strong>{" "}
                for {data.discountPercent}% off!
              </p>
            </div>)}

          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-5">
              What&apos;s Available
            </h3>
            {data.items?.map((item, index) => (<div key={index} className="bg-gray-50 rounded-lg p-4 mb-3 flex items-center">
                {item.image && (<div className="w-16 h-16 mr-4">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover rounded-lg"/>
                  </div>)}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {item.name || `[Item ${index + 1} Name]`}
                  </h4>
                  <p className="text-lg font-bold text-green-600">
                    {item.price || "$[Price]"}
                  </p>
                </div>
              </div>))}
          </div>

          
          {data.shopUrl && (<div className="text-center mb-8">
              <a href={data.shopUrl} className="inline-block bg-green-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg">
                🛒 Shop Now
              </a>
              {data.limitedTime && (<p className="text-red-600 text-sm font-semibold mt-3">
                  ⚡ Hurry - limited quantities available!
                </p>)}
            </div>)}

          
          <div className="bg-gray-50 p-6 text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Stay Connected
            </h4>
            <div className="flex justify-center gap-6">
              {data.instagramUrl && (<a href={data.instagramUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  📸 Instagram
                </a>)}
              {data.websiteUrl && (<a href={data.websiteUrl} className="text-indigo-600 font-medium hover:text-indigo-700">
                  🌐 Website
                </a>)}
            </div>
          </div>

          
          <div className="bg-gray-800 text-gray-300 p-6 text-center text-sm leading-relaxed">
            Thanks for supporting the music! 🙏
            <br />
            You&apos;re receiving this because you signed up for updates from{" "}
            {data.artistName || "[Artist Name]"}.
          </div>
        </div>
      </div>
    </div>);
}
