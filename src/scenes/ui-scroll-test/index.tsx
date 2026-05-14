import ReactEcs, { UiEntity, Label, type JSX } from '@dcl/sdk/react-ecs'

const ITEMS = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`)

const BasicScroll = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '5%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Basic vertical scroll  (overflow: scroll)"
      uiTransform={{ width: 280, height: 22 }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />
    <UiEntity
      uiTransform={{
        width: 280,
        height: 300,
        overflow: 'scroll',
        flexDirection: 'column'
      }}
      uiBackground={{ color: { r: 0.1, g: 0.1, b: 0.15, a: 0.95 } }}
    >
      {ITEMS.map((item, i) => (
        <UiEntity
          key={`basic-${i}`}
          uiTransform={{
            width: '100%',
            height: 50,
            alignItems: 'center',
            margin: { bottom: 4 }
          }}
          uiBackground={{
            color:
              i % 2 === 0
                ? { r: 0.2, g: 0.25, b: 0.35, a: 1 }
                : { r: 0.15, g: 0.18, b: 0.28, a: 1 }
          }}
        >
          <Label
            value={item}
            uiTransform={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            fontSize={15}
            color={{ r: 0.85, g: 0.9, b: 1, a: 1 }}
          />
        </UiEntity>
      ))}
    </UiEntity>
  </UiEntity>
)

const ModalScroll = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '35%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Fixed header/footer + scrollable body"
      uiTransform={{ width: 320, height: 22 }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />
    <UiEntity
      uiTransform={{
        width: 320,
        height: 380,
        flexDirection: 'column'
      }}
      uiBackground={{ color: { r: 0.12, g: 0.12, b: 0.18, a: 0.97 } }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 50,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        uiBackground={{ color: { r: 0.2, g: 0.45, b: 0.7, a: 1 } }}
      >
        <Label
          value="Header (fixed)"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={15}
          color={{ r: 1, g: 1, b: 1, a: 1 }}
        />
      </UiEntity>

      <UiEntity
        uiTransform={{
          width: '100%',
          flexGrow: 1,
          overflow: 'scroll',
          flexDirection: 'column',
          padding: { left: 8, right: 8, top: 6, bottom: 6 }
        }}
      >
        {ITEMS.map((item, i) => (
          <UiEntity
            key={`modal-${i}`}
            uiTransform={{
              width: '100%',
              height: 44,
              alignItems: 'center',
              margin: { bottom: 4 }
            }}
            uiBackground={{ color: { r: 0.22, g: 0.28, b: 0.4, a: 1 } }}
          >
            <Label
              value={item}
              uiTransform={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              fontSize={14}
              color={{ r: 0.85, g: 0.9, b: 1, a: 1 }}
            />
          </UiEntity>
        ))}
      </UiEntity>

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 46,
          alignItems: 'center',
          justifyContent: 'center'
        }}
        uiBackground={{ color: { r: 0.18, g: 0.38, b: 0.22, a: 1 } }}
      >
        <Label
          value="Footer (fixed)"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={15}
          color={{ r: 1, g: 1, b: 1, a: 1 }}
        />
      </UiEntity>
    </UiEntity>
  </UiEntity>
)

const HorizontalScroll = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '65%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Horizontal scroll"
      uiTransform={{ width: 300, height: 22 }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />
    <UiEntity
      uiTransform={{
        width: 300,
        height: 160,
        overflow: 'scroll',
        flexDirection: 'row'
      }}
      uiBackground={{ color: { r: 0.1, g: 0.1, b: 0.15, a: 0.95 } }}
    >
      {ITEMS.map((item, i) => (
        <UiEntity
          key={`horiz-${i}`}
          uiTransform={{
            width: 100,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            margin: { right: 4 }
          }}
          uiBackground={{
            color: {
              r: 0.1 + i * 0.05,
              g: 0.3,
              b: 0.6 - i * 0.03,
              a: 1
            }
          }}
        >
          <Label
            value={item}
            uiTransform={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            fontSize={13}
            color={{ r: 1, g: 1, b: 1, a: 1 }}
          />
        </UiEntity>
      ))}
    </UiEntity>
  </UiEntity>
)

export function main(): void {
  console.log('[UI Scroll Test] Initialized (pure UI scene)')
}

export function UI(): JSX.Element {
  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
      <BasicScroll />
      <ModalScroll />
      <HorizontalScroll />
    </UiEntity>
  )
}
