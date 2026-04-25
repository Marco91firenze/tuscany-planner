import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'text',
      rows: 8,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'durationClass',
      title: 'Duration Class',
      type: 'string',
      options: {
        list: [
          { title: 'Half Day', value: 'HALF_DAY' },
          { title: 'Full Day', value: 'FULL_DAY' },
          { title: 'Evening', value: 'EVENING' },
          { title: 'Flexible', value: 'FLEXIBLE' },
          { title: 'Multi-Day', value: 'MULTI_DAY' },
        ],
      },
    }),
    defineField({
      name: 'defaultSlot',
      title: 'Default Slot',
      type: 'string',
      options: {
        list: [
          { title: 'Morning', value: 'MORNING' },
          { title: 'Afternoon', value: 'AFTERNOON' },
          { title: 'Evening', value: 'EVENING' },
          { title: 'Full Day', value: 'FULL_DAY' },
        ],
      },
    }),
    defineField({
      name: 'minParticipants',
      title: 'Min Participants',
      type: 'number',
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'maxParticipants',
      title: 'Max Participants',
      type: 'number',
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'food',
          'wine',
          'driving',
          'outdoor',
          'water',
          'shopping',
          'aerial',
          'cultural',
        ],
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
