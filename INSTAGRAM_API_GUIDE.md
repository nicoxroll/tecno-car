# Instagram API Integration Guide

## Current Implementation
The Gallery component currently uses placeholder images that simulate Instagram posts. The structure is ready for real Instagram API integration.

## Required Setup for Instagram Basic Display API

### 1. Create a Facebook Developer Account
- Go to https://developers.facebook.com/
- Create an app or use an existing one

### 2. Set up Instagram Basic Display
- In your app dashboard, add "Instagram Basic Display" product
- Configure the app settings

### 3. Get Access Token
- Use the Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Select your app and Instagram Basic Display
- Generate a user access token

### 4. Environment Variables
Add to your `.env` file:
```
REACT_APP_INSTAGRAM_ACCESS_TOKEN=your_access_token_here
REACT_APP_INSTAGRAM_USER_ID=your_user_id_here
```

### 5. API Endpoint
Use this endpoint to fetch media:
```
https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption,media_type&access_token=YOUR_ACCESS_TOKEN
```

### 6. Implementation Code
Replace the placeholder code in `Gallery.tsx` with:

```typescript
const fetchInstagramPosts = async () => {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,caption,media_type&access_token=${process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN}`
    );

    const imagePosts = response.data.data
      .filter((post: InstagramPost) => post.media_type === 'IMAGE')
      .slice(0, 6)
      .map((post: InstagramPost) => ({
        id: post.id,
        img: post.media_url,
        title: post.caption ? post.caption.substring(0, 30) + '...' : 'Instagram Post',
        permalink: post.permalink
      }));

    setPosts(imagePosts);
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    // Fallback to placeholder images
    setPosts(placeholderPosts);
  }
};
```

## Notes
- Access tokens expire, so implement token refresh logic
- Consider rate limiting and error handling
- The current UI already supports Instagram permalinks in the modal