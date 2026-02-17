/**
 * Transform media URLs (Google Drive, YouTube, etc.) to usable formats
 */

/**
 * Extract Google Drive file ID from various link formats
 */
export function getDriveFileId(url: string): string | null {
    if (!url) return null;

    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
    const pattern1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = url.match(pattern1);
    if (match1) return match1[1];

    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    const pattern2 = /id=([a-zA-Z0-9_-]+)/;
    const match2 = url.match(pattern2);
    if (match2 && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
        return match2[1];
    }

    return null;
}

/**
 * Transform diverse image URLs to a direct source usable in <Image>
 */
export function getOptimizedImageUrl(url: string): string {
    if (!url) return "";

    const fileId = getDriveFileId(url);
    if (fileId) {
        // Return high-res thumbnail URL which acts as a direct image link
        // This often redirects to lh3.googleusercontent.com
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    return url;
}

/**
 * Transform video URLs to embeddable formats
 */
export function getOptimizedVideoUrl(url: string): string {
    if (!url) return "";

    const fileId = getDriveFileId(url);
    if (fileId) {
        // Return Google Drive preview/embed URL
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Handle YouTube (simple check)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
}
