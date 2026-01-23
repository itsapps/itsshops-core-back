import React from 'react';
import {Container, Spinner, Card} from '@sanity/ui'

export function LoadingBox({ content, loading }: { content: React.ReactNode, loading: boolean }) {
  return (
    <Container style={{ position: 'relative' }}>
      {content}
      {loading && (
        <Card
          tone="transparent"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10,
          }}
      >
          <Spinner size={4} muted />
        </Card>
      )}
    </Container>
  )
}
