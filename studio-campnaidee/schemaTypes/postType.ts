import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'providerId',
      title: 'Provider ID',
      type: 'string',
      description: 'ID ของเจ้าของลานจาก Google Provider (สำหรับการยืนยันสิทธิ์)',
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'recommend', value: 'recommend'},
              {title: 'new', value: 'new'},
              {title: 'nearBangkok', value: 'nearBangkok'},
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
    }),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({
          name: 'region',
          title: 'Region',
          type: 'string',
        }),
        defineField({
          name: 'province',
          title: 'Province',
          type: 'string',
        }),
        defineField({
          name: 'district',
          title: 'District',
          type: 'string',
        }),
        defineField({
          name: 'subdistrict',
          title: 'Subdistrict',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery (รูปภาพ)',
      description: 'สามารถลากหลายรูปมาวางพร้อมกันได้ และสามารถลากเรียงลำดับรูปได้',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              initialValue: 'วิว',
              options: {
                list: [
                  {title: 'วิว', value: 'วิว'},
                  {title: 'ที่พัก', value: 'ที่พัก'},
                  {title: 'กิจกรรม', value: 'กิจกรรม'},
                  {title: 'ห้องน้ำ', value: 'ห้องน้ำ'},
                ],
                layout: 'dropdown',
              },
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              media: 'asset',
              category: 'category',
              alt: 'alt',
            },
            prepare({media, category, alt}) {
              return {
                title: category || 'วิว',
                subtitle: alt || '',
                media: media,
              }
            },
          },
        },
      ],
      options: {
        layout: 'grid',
      },
      validation: (Rule) => Rule.min(1).error('ต้องมีรูปภาพอย่างน้อย 1 รายการ'),
    }),
    defineField({
      name: 'videos',
      title: 'Videos (วิดีโอ)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'videoUrl',
          title: 'Video URL',
          fields: [
            defineField({
              name: 'url',
              title: 'Video URL',
              type: 'url',
              description:
                'วางลิงค์วิดีโอจาก YouTube URL ที่นี่ เช่น https://www.youtube.com/embed/VIDEO_ID หรือ https://www.youtube.com/watch?v=VIDEO_ID',
              validation: (rule) => rule.required().error('กรุณาใส่ลิงค์วิดีโอ'),
            }),

            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [{title: 'YouTube', value: 'youtube'}],
                layout: 'radio',
              },
              initialValue: 'youtube',
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              initialValue: 'วิดีโอ',
              readOnly: true,
              hidden: false,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              url: 'url',
              platform: 'platform',
            },
            prepare({title, url, platform}) {
              return {
                title: title || 'Video URL',
                subtitle: `${platform ? platform.toUpperCase() : 'VIDEO'} - ${url || 'No URL'}`,
                media: () => '🎬',
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{type: 'block'}],
    }),

    defineField({
      name: 'socialContactLinks',
      title: 'Social Contact Links',
      type: 'object',
      fields: [
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
        }),
        defineField({
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
        }),
        defineField({
          name: 'line',
          title: 'Line',
          type: 'url',
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
        }),
        defineField({
          name: 'googleMap',
          title: 'Google Map',
          type: 'url',
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'otherBenefits',
      title: 'Other Benefits',
      type: 'object',
      fields: [
        defineField({
          name: 'checkIn',
          title: 'Check In',
          type: 'string',
        }),
        defineField({
          name: 'checkOut',
          title: 'Check Out',
          type: 'string',
        }),
        defineField({
          name: 'cabin',
          title: 'Cabin',
          type: 'string',
        }),
        defineField({
          name: 'nature',
          title: 'Nature',
          type: 'string',
        }),
        defineField({
          name: 'noNoise',
          title: 'No Noise',
          type: 'string',
        }),
        defineField({
          name: 'petFriendly',
          title: 'Pet Friendly',
          type: 'string',
        }),
        defineField({
          name: 'wifi',
          title: 'WiFi',
          type: 'string',
        }),
        defineField({
          name: 'priceOfStay',
          title: 'Price Of Stay',
          type: 'string',
        }),
        defineField({
          name: 'food',
          title: 'Food',
          type: 'string',
        }),
      ],
    }),
  ],
})
