import { useRef, useState, useLayoutEffect, useEffect, KeyboardEvent } from 'react'
import { IfcViewerAPI } from 'web-ifc-viewer'
import { Color } from 'three'

const IfcContainer = () => {
  const ifcContainer = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<IfcViewerAPI>()

  const loadIfc = async (container: HTMLDivElement) => {
    const ifcViewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) })
    ifcViewer.addAxes()
    ifcViewer.addGrid()
    await ifcViewer.IFC.loader.ifcManager.applyWebIfcConfig({
      COORDINATE_TO_ORIGIN: true,
      USE_FAST_BOOLS: false
    })
    return ifcViewer
  }

  const multithreading = async (viewer: IfcViewerAPI) => {
    await viewer.IFC.loader.ifcManager.useWebWorkers(true, '../../../IFCWorker.js')
    await viewer.IFC.setWasmPath('../../../')
  }

  const loadModel = async (viewer: IfcViewerAPI, url: string) => {
    const model = await viewer.IFC.loadIfcUrl(url)
    viewer.shadowDropper.renderShadow(model.modelID)
    viewer.clipper.active = true
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
  else if(event.code === 'KeyO') {
      viewer.clipper.deletePlane()
  }
  }

  useLayoutEffect(() => {
    let ifcViewer: IfcViewerAPI
    const initialize = async (ifcContainer: HTMLDivElement) => {
      ifcViewer = await loadIfc(ifcContainer)
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
    if (!viewer) return
    multithreading(viewer)
    loadModel(viewer, '../../../01.ifc')
  }, [viewer])

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