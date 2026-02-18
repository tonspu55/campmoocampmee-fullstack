import {defineField, defineType} from 'sanity'

export const submitContactType = defineType({
  name: 'submitContact',
  title: 'Submit Contact',
  type: 'document',
  fields: [
    defineField({
      name: 'campName',
      title: 'ชื่อแคมป์',
      type: 'string',
      validation: (rule) => rule.required().min(3).error('ชื่อแคมป์ต้องมีอย่างน้อย 3 ตัวอักษร'),
    }),
    defineField({
      name: 'telNumber',
      title: 'เบอร์โทรศัพท์',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .min(9)
          .regex(/^[0-9-+\s]+$/)
          .error('เบอร์ติดต่อต้องเป็นตัวเลขและมีอย่างน้อย 9 หลัก'),
    }),
    defineField({
      name: 'lineId',
      title: 'Line ID',
      type: 'string',
      description: 'Line ID ไม่บังคับกรอก',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'รอดำเนินการ', value: 'pending'},
          {title: 'กำลังติดต่อ', value: 'contacting'},
          {title: 'เสร็จสิ้น', value: 'completed'},
        ],
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'campName',
      subtitle: 'status',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: title || 'ไม่มีชื่อแคมป์',
        subtitle: `Status: ${subtitle || 'ไม่ได้ระบุ'}`,
      }
    },
  },
  orderings: [
    {
      title: 'วันที่ส่งล่าสุด',
      name: 'submittedAtDesc',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
    {
      title: 'วันที่ส่งเก่าสุด',
      name: 'submittedAtAsc',
      by: [{field: 'submittedAt', direction: 'asc'}],
    },
  ],
})
