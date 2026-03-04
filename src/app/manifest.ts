import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Sruthi 3D Print - Custom 3D Printing',
        short_name: 'Sruthi 3D',
        description: 'Looking for high-quality 3d print services? 3D Print with Sruthi provides custom 3D printing, prototypes, and personalized gifts.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
