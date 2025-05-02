// app/page.tsx

import { prisma } from '../lib/prisma'
import Link from 'next/link'

export default async function Home() {
  // If you don't need to fetch a specific project, you can remove the whole .findFirst:
  const project = await prisma.project.findFirst();

  return (
    <main
      style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#D4C9BE',
        marginTop: '3rem',
        borderRadius: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: 'fit-content',
        margin: '2rem auto',
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          color: '#F1EFEC',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        Welcome to the Task Manager Dashboard!
      </h1>

      {/* Always show the link to /projects */}
      <div style={{ marginTop: '2rem' }}>
        <Link
          href="/projects"
          style={{
            textDecoration: 'none',
            color: '#FFFFFF',
            backgroundColor: '#123458',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.25rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            display: 'inline-block',
            /* textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', */
          }}
          className="home-button"
        >
          View all Projects
        </Link>
      </div>

      {/* Optionally show info about the found project
      {project ? (
        <p
          style={{
            fontSize: '1.5rem',
            marginTop: '1rem',
            color: '#EEF1DA',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
          }}
        >
          Found project: {project.project_name}
        </p>
      ) : (
        <p style={{ fontSize: '1.25rem', color: '#C7D9DD', marginTop: '2rem' }}>
          No project found. Please create a new one!
        </p>
      )} */}
    </main>
  )
}
