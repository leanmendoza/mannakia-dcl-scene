import ReactEcs, { UiEntity, Label, type JSX } from '@dcl/sdk/react-ecs'

const Group1 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      positionType: 'absolute',
      position: { top: '5%', left: '5%' }
    }}
  >
    <Label
      value="Group 1: zIndex matches declaration order"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 350,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 250,
        height: 200,
        zIndex: 1
      }}
      uiBackground={{ color: { r: 0.8, g: 0.2, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="A — declared 1st  zIndex 1"
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
        positionType: 'absolute',
        position: { top: 50, left: 75 },
        width: 250,
        height: 200,
        zIndex: 2
      }}
      uiBackground={{ color: { r: 0.2, g: 0.7, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="B — declared 2nd  zIndex 2"
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
        positionType: 'absolute',
        position: { top: 100, left: 150 },
        width: 250,
        height: 200,
        zIndex: 3
      }}
      uiBackground={{ color: { r: 0.2, g: 0.4, b: 0.9, a: 0.9 } }}
    >
      <Label
        value="C — declared 3rd  zIndex 3"
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
)

const Group2 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      positionType: 'absolute',
      position: { top: '55%', left: '5%' }
    }}
  >
    <Label
      value="Group 2: zIndex REVERSED vs declaration order"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 380,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 250,
        height: 200,
        zIndex: 3
      }}
      uiBackground={{ color: { r: 0.8, g: 0.2, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="X — declared 1st  zIndex 3"
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
        positionType: 'absolute',
        position: { top: 50, left: 75 },
        width: 250,
        height: 200,
        zIndex: 2
      }}
      uiBackground={{ color: { r: 0.2, g: 0.7, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="Y — declared 2nd  zIndex 2"
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
        positionType: 'absolute',
        position: { top: 100, left: 150 },
        width: 250,
        height: 200,
        zIndex: 1
      }}
      uiBackground={{ color: { r: 0.2, g: 0.4, b: 0.9, a: 0.9 } }}
    >
      <Label
        value="Z — declared 3rd  zIndex 1"
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
)

const Group3 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      positionType: 'absolute',
      position: { top: '5%', left: '55%' }
    }}
  >
    <Label
      value="Group 3: child zIndex vs parent stacking context"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 380,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 220,
        height: 220,
        zIndex: 1
      }}
      uiBackground={{ color: { r: 0.7, g: 0.15, b: 0.15, a: 0.95 } }}
    >
      <Label
        value="P1 (zIndex 1)"
        uiTransform={{
          positionType: 'absolute',
          position: { top: 8, left: 8 },
          width: 200,
          height: 20
        }}
        fontSize={14}
        color={{ r: 1, g: 1, b: 1, a: 1 }}
      />
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: 60, left: 60 },
          width: 180,
          height: 100,
          zIndex: 99
        }}
        uiBackground={{ color: { r: 0.9, g: 0.7, b: 0.1, a: 0.95 } }}
      >
        <Label
          value="C1 child of P1  zIndex 99"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={14}
          color={{ r: 0, g: 0, b: 0, a: 1 }}
        />
      </UiEntity>
    </UiEntity>

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 80, left: 80 },
        width: 220,
        height: 220,
        zIndex: 2
      }}
      uiBackground={{ color: { r: 0.15, g: 0.35, b: 0.8, a: 0.95 } }}
    >
      <Label
        value="P2 (zIndex 2)"
        uiTransform={{
          positionType: 'absolute',
          position: { top: 8, left: 8 },
          width: 200,
          height: 20
        }}
        fontSize={14}
        color={{ r: 1, g: 1, b: 1, a: 1 }}
      />
      <Label
        value="Does C1 (zIndex 99) appear above this?"
        uiTransform={{
          positionType: 'absolute',
          position: { top: 100, left: 10 },
          width: 200,
          height: 60
        }}
        fontSize={13}
        color={{ r: 1, g: 1, b: 1, a: 1 }}
      />
    </UiEntity>
  </UiEntity>
)

let g4LastClicked = 'none'

const Group4 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 420,
      height: 320,
      positionType: 'absolute',
      position: { top: '55%', left: '55%' }
    }}
  >
    <Label
      value="Group 4: pointerFilter vs zIndex"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 380,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 240,
        height: 180,
        zIndex: 1,
        pointerFilter: 'block'
      }}
      uiBackground={{ color: { r: 0.8, g: 0.15, b: 0.15, a: 0.95 } }}
      onMouseDown={() => {
        g4LastClicked = 'LOW (red, zIndex 1, block)'
      }}
    >
      <Label
        value={'Low — zIndex 1  pointerFilter: block'}
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

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 60, left: 90 },
        width: 240,
        height: 180,
        zIndex: 3,
        pointerFilter: 'none'
      }}
      uiBackground={{ color: { r: 0.15, g: 0.35, b: 0.85, a: 0.95 } }}
    >
      <Label
        value={'High — zIndex 3  pointerFilter: none'}
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

    <Label
      value={`Last clicked: ${g4LastClicked}`}
      uiTransform={{
        positionType: 'absolute',
        position: { top: 270, left: 0 },
        width: 300,
        height: 30
      }}
      fontSize={14}
      color={{ r: 1, g: 0.9, b: 0.1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 268, left: 310 },
        width: 90,
        height: 28,
        pointerFilter: 'block'
      }}
      uiBackground={{ color: { r: 0.3, g: 0.3, b: 0.3, a: 0.95 } }}
      onMouseDown={() => {
        g4LastClicked = 'none'
      }}
    >
      <Label
        value="Clear"
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
  </UiEntity>
)

const Group5 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      positionType: 'absolute',
      position: { top: '5%', left: '30%' }
    }}
  >
    <Label
      value="Group 5: all negative zIndex"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 350,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 250,
        height: 200,
        zIndex: -1
      }}
      uiBackground={{ color: { r: 0.8, g: 0.2, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="A — declared 1st  zIndex -1"
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
        positionType: 'absolute',
        position: { top: 50, left: 75 },
        width: 250,
        height: 200,
        zIndex: -2
      }}
      uiBackground={{ color: { r: 0.2, g: 0.7, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="B — declared 2nd  zIndex -2"
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
        positionType: 'absolute',
        position: { top: 100, left: 150 },
        width: 250,
        height: 200,
        zIndex: -3
      }}
      uiBackground={{ color: { r: 0.2, g: 0.4, b: 0.9, a: 0.9 } }}
    >
      <Label
        value="C — declared 3rd  zIndex -3"
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
)

const Group6 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      positionType: 'absolute',
      position: { top: '55%', left: '30%' }
    }}
  >
    <Label
      value="Group 6: extreme zIndex range"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 350,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 0, left: 0 },
        width: 250,
        height: 200,
        zIndex: -999999
      }}
      uiBackground={{ color: { r: 0.8, g: 0.2, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="A — zIndex -999999"
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
        positionType: 'absolute',
        position: { top: 50, left: 75 },
        width: 250,
        height: 200,
        zIndex: 0
      }}
      uiBackground={{ color: { r: 0.2, g: 0.7, b: 0.2, a: 0.9 } }}
    >
      <Label
        value="B — zIndex 0"
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
        positionType: 'absolute',
        position: { top: 100, left: 150 },
        width: 250,
        height: 200,
        zIndex: 999999
      }}
      uiBackground={{ color: { r: 0.2, g: 0.4, b: 0.9, a: 0.9 } }}
    >
      <Label
        value="C — zIndex 999999"
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
)

const Group7 = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      width: 500,
      height: 320,
      positionType: 'absolute',
      position: { top: '33%', left: '30%' }
    }}
  >
    <Label
      value="Group 7: cross-hierarchy — naive order vs actual"
      uiTransform={{
        positionType: 'absolute',
        position: { top: -25, left: 0 },
        width: 460,
        height: 20
      }}
      fontSize={13}
      color={{ r: 1, g: 1, b: 1, a: 1 }}
    />
    <Label
      value="Naive: A1(z10) > B1(z1)   Actual: B1 wins — parent B(z2) > parent A(z1)"
      uiTransform={{
        positionType: 'absolute',
        position: { top: 280, left: 0 },
        width: 500,
        height: 30
      }}
      fontSize={12}
      color={{ r: 1, g: 0.85, b: 0.2, a: 1 }}
    />

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 20, left: 0 },
        width: 300,
        height: 240,
        zIndex: 1
      }}
      uiBackground={{ color: { r: 0.45, g: 0.08, b: 0.08, a: 0.85 } }}
    >
      <Label
        value="Tree A  parent zIndex 1"
        uiTransform={{
          positionType: 'absolute',
          position: { top: 6, left: 8 },
          width: 280,
          height: 20
        }}
        fontSize={13}
        color={{ r: 1, g: 0.6, b: 0.6, a: 1 }}
      />
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: 80, left: 130 },
          width: 160,
          height: 100,
          zIndex: 10
        }}
        uiBackground={{ color: { r: 0.95, g: 0.55, b: 0.1, a: 0.95 } }}
      >
        <Label
          value="A1  zIndex 10"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={14}
          color={{ r: 0, g: 0, b: 0, a: 1 }}
        />
      </UiEntity>
    </UiEntity>

    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 20, left: 200 },
        width: 300,
        height: 240,
        zIndex: 2
      }}
      uiBackground={{ color: { r: 0.08, g: 0.15, b: 0.45, a: 0.85 } }}
    >
      <Label
        value="Tree B  parent zIndex 2"
        uiTransform={{
          positionType: 'absolute',
          position: { top: 6, left: 8 },
          width: 280,
          height: 20
        }}
        fontSize={13}
        color={{ r: 0.6, g: 0.7, b: 1, a: 1 }}
      />
      <UiEntity
        uiTransform={{
          positionType: 'absolute',
          position: { top: 80, left: 10 },
          width: 160,
          height: 100,
          zIndex: 1
        }}
        uiBackground={{ color: { r: 0.3, g: 0.8, b: 0.9, a: 0.95 } }}
      >
        <Label
          value="B1  zIndex 1"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={14}
          color={{ r: 0, g: 0, b: 0, a: 1 }}
        />
      </UiEntity>
    </UiEntity>
  </UiEntity>
)

export function main(): void {
  console.log('[UI zIndex Test] Initialized (pure UI scene)')
  g4LastClicked = 'none'
}

export function UI(): JSX.Element {
  return (
    <UiEntity
      uiTransform={{
        positionType: 'absolute',
        position: { top: 90, left: 0, right: 0, bottom: 0 }
      }}
    >
      <Group1 />
      <Group2 />
      <Group3 />
      <Group4 />
      <Group5 />
      <Group6 />
      <Group7 />
    </UiEntity>
  )
}
