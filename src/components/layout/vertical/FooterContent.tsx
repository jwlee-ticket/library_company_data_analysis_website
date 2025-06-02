'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  return (
    <div className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-end flex-wrap gap-4')}>
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()}, Made with `}</span>
        <span>{`❤️`}</span>
        <span className='text-textSecondary'>{` by `}</span>
        <Link href='https://www.librarycompany.co.kr/' target='_blank' className='text-primary uppercase'>
          Library Company
        </Link>
      </p>
    </div>
  )
}

export default FooterContent
