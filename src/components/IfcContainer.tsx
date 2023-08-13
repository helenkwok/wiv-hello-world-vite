import { useRef, useState, useLayoutEffect, useEffect, KeyboardEvent } from 'react'
import { IfcViewerAPI } from 'web-ifc-viewer'
import { Color } from 'three'

const IfcContainer = () => {
  const ifcContainer = useRef<HTMLDivElement>(null)
  const [initialViewer, setInitialViewer] = useState<IfcViewerAPI | null>(null)
  const [viewer, setViewer] = useState<IfcViewerAPI | null>(null)

  const loadIfc = async (container: HTMLDivElement) => {
    const ifcViewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) })
    ifcViewer.axes.setAxes()
    ifcViewer.grid.setGrid()
    await ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
      COORDINATE_TO_ORIGIN: true,
      USE_FAST_BOOLS: false
    })
    return ifcViewer
  }

  const loadModel = async (viewer: IfcViewerAPI, url: string) => {
    await viewer.IFC.setWasmPath('./')
    const model = await viewer.IFC.loadIfcUrl(url)
    viewer.shadowDropper.renderShadow(model.modelID)
    viewer.clipper.active = true
    setInitialViewer(null)
  }

  const ifcCleanup = async (ifcViewer: IfcViewerAPI) => {
    await ifcViewer.dispose()
  }

  const handleOnDoubleClick = () => {
    if (!viewer) return
    viewer.IFC.selector.pickIfcItem(true)
  }

  const handleMouseMove = () => {
    if (!viewer) return
    viewer.IFC.selector.prePickIfcItem()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!viewer) return
    if(event.code === 'KeyP') {
      viewer.clipper.createPlane()
    }
    if(event.code === 'KeyO') {
      viewer.clipper.deletePlane()
    }
  }

  useLayoutEffect(() => {
    let ifcViewer: IfcViewerAPI

    const initialize = async (ifcContainer: HTMLDivElement) => {
      ifcViewer = await loadIfc(ifcContainer)
      setInitialViewer(ifcViewer)
      setViewer(ifcViewer)
    }

    if (ifcContainer.current) {
      initialize(ifcContainer.current)
    }

    return () => {
      if (ifcViewer) {
        ifcCleanup(ifcViewer)
      }
    }
  }, [])

  useEffect(() => {
    if (initialViewer) {
      loadModel(initialViewer, './01.ifc')
    }
  }, [initialViewer])

  return (
    <div className={'ifcContainer'}
      ref={ifcContainer}
      tabIndex={0}
      onDoubleClick={handleOnDoubleClick}
      onMouseMove={handleMouseMove}
      onKeyDown={event => handleKeyDown(event)}
    />
  )
}

export default IfcContainer