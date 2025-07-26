import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
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
              {title: 'แคมป์แนะนำ', value: 'แคมป์แนะนำ'},
              {title: 'แคมป์เปิดใหม่', value: 'แคมป์เปิดใหม่'},
              {title: 'แคมป์ไกล้กรุงเทพ', value: 'แคมป์ไกล้กรุงเทพ'},
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
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
            accept: 'image/*',
            storeOriginalFilename: false,
          },
          fields: [
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              validation: (rule) => rule.required().error('กรุณาเลือกหมวดหมู่'),
              options: {
                list: [
                  {title: 'วิว', value: 'วิว'},
                  {title: 'ที่พัก', value: 'ที่พัก'},
                  {title: 'กิจกรรม', value: 'กิจกรรม'},
                  {title: 'ห้องน้ำ', value: 'ห้องน้ำ'},
                ],
                layout: 'dropdown',
              },
              initialValue: 'วิว',
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
      validation: (Rule) => Rule.min(1).error('ต้องมีรูปภาพอย่างน้อย 1 รูป'),
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
