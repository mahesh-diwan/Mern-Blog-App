import React from 'react'
import CallToAction from '../components/CallToAction'

export default function Projects() {
  return (
    <div className='min-h-screen max-w-2xl mx-auto flex flex-col gap-6 p-3 justify-center items-center my-4'>
      <h1 className='text-3xl font-semibold'>Projects</h1>
      <p className='text-md font-semibold'>Build fun and engaging projects while learning HTML, CSS and Javascript.</p>
      <CallToAction/>
    </div>
  )
}
