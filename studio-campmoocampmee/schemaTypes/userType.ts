import {defineField, defineType} from 'sanity'

export const userType = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      // Plain string (no .email()): phone-only users store a non-email
      // placeholder identifier here, not a real email.
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'url',
    }),
    defineField({
      name: 'provider',
      title: 'Auth Provider',
      type: 'string',
    }),
    defineField({
      name: 'providerId',
      title: 'Provider ID',
      type: 'string',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title,
        subtitle,
      }
    },
  },
})
