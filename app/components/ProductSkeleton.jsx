export function ProductSkeleton() {
    return (
        <div
            className="product-item-skeleton"
            style={{
                display: 'block',
                marginBottom: '20px'
            }}
        >
            <div style={{
                overflow: 'hidden',
                borderRadius: '999px 999px 0 0',
                aspectRatio: '1/1',
                position: 'relative',
                backgroundColor: '#f3f4f6',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    animation: 'shimmer 1.5s infinite'
                }}></div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
        `
            }} />
        </div>
    );
}