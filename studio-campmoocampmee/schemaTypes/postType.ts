import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  groups: [
    {name: 'basic', title: 'ข้อมูลพื้นฐาน', default: true},
    {name: 'location', title: 'สถานที่'},
    {name: 'media', title: 'สื่อ (รูป/วิดีโอ)'},
    {name: 'detail', title: 'รายละเอียด'},
    {name: 'contact', title: 'ช่องทางติดต่อ'},
    {name: 'benefits', title: 'สิ่งอำนวยความสะดวก'},
  ],
  fields: [
    // ── ข้อมูลพื้นฐาน ──────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'ชื่อลาน',
      type: 'string',
      group: 'basic',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'basic',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'วันที่เผยแพร่',
      type: 'datetime',
      group: 'basic',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'basic',
      of: [
        {
          type: 'string',
          options: {
            list: [
              {title: 'แนะนำ', value: 'recommend'},
              {title: 'เปิดใหม่', value: 'new'},
              {title: 'ใกล้กรุงเทพ', value: 'nearBangkok'},
              {title: 'วิวภูเขา', value: 'mountainView'},
              {title: 'วิวทะเล', value: 'seaView'},
              {title: 'ริมน้ำ', value: 'riverView'},
              {title: 'ตกปลา', value: 'fishing'},
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'thumbnail',
      title: 'รูปปก (Thumbnail)',
      type: 'image',
      group: 'basic',
    }),
    defineField({
      name: 'providerId',
      title: 'Provider ID',
      type: 'string',
      group: 'basic',
      description: 'ID ของเจ้าของลานจาก Google Provider (สำหรับการยืนยันสิทธิ์)',
    }),

    // ── สถานที่ ─────────────────────────────────────────────────────
    defineField({
      name: 'address',
      title: 'ที่อยู่',
      type: 'object',
      group: 'location',
      fields: [
        defineField({name: 'region', title: 'ภาค', type: 'string'}),
        defineField({name: 'province', title: 'จังหวัด', type: 'string'}),
        defineField({name: 'district', title: 'อำเภอ', type: 'string'}),
        defineField({name: 'subdistrict', title: 'ตำบล', type: 'string'}),
      ],
    }),
    defineField({
      name: 'location',
      title: 'พิกัด GPS',
      type: 'geopoint',
      group: 'location',
      description: 'ใส่พิกัด GPS สำหรับแสดงบนแผนที่ (ละติจูด, ลองจิจูด)',
    }),

    // ── สื่อ ────────────────────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Gallery (รูปภาพ)',
      description: 'สามารถลากหลายรูปมาวางพร้อมกันได้ และสามารถลากเรียงลำดับรูปได้',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
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
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
          ],
          preview: {
            select: {media: 'asset', category: 'category', alt: 'alt'},
            prepare({media, category, alt}) {
              return {title: category || 'วิว', subtitle: alt || '', media}
            },
          },
        },
      ],
      options: {layout: 'grid'},
      validation: (Rule) => Rule.min(1).error('ต้องมีรูปภาพอย่างน้อย 1 รายการ'),
    }),
    defineField({
      name: 'videos',
      title: 'Videos (วิดีโอ)',
      type: 'array',
      group: 'media',
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
              options: {list: [{title: 'YouTube', value: 'youtube'}], layout: 'radio'},
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
            select: {title: 'title', url: 'url', platform: 'platform'},
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

    // ── รายละเอียด ──────────────────────────────────────────────────
    defineField({
      name: 'body',
      title: 'เนื้อหา',
      type: 'array',
      group: 'detail',
      of: [{type: 'block'}],
    }),

    // ── ช่องทางติดต่อ ────────────────────────────────────────────────
    defineField({
      name: 'socialContactLinks',
      title: 'Social & Contact',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'phone', title: 'เบอร์โทร', type: 'string'}),
        defineField({name: 'line', title: 'Line', type: 'url'}),
        defineField({name: 'facebook', title: 'Facebook', type: 'url'}),
        defineField({name: 'instagram', title: 'Instagram', type: 'url'}),
        defineField({name: 'tiktok', title: 'TikTok', type: 'url'}),
        defineField({name: 'googleMap', title: 'Google Map', type: 'url'}),
      ],
    }),

    // ── สิ่งอำนวยความสะดวก ───────────────────────────────────────────
    defineField({
      name: 'otherBenefits',
      title: 'สิ่งอำนวยความสะดวก',
      type: 'object',
      group: 'benefits',
      fields: [
        defineField({name: 'checkIn', title: 'Check In', type: 'string'}),
        defineField({name: 'checkOut', title: 'Check Out', type: 'string'}),
        defineField({name: 'priceOfStay', title: 'ราคาที่พัก', type: 'string'}),
        defineField({name: 'cabin', title: 'กระท่อม / เต็นท์', type: 'string'}),
        defineField({name: 'food', title: 'อาหาร', type: 'string'}),
        defineField({name: 'petFriendly', title: 'Pet Friendly', type: 'string'}),
        defineField({name: 'wifi', title: 'WiFi', type: 'string'}),
        defineField({name: 'nature', title: 'ธรรมชาติ', type: 'string'}),
        defineField({name: 'noNoise', title: 'เงียบสงบ', type: 'string'}),
      ],
    }),
  ],
})
