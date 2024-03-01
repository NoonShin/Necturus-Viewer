import pic from '../assets/0015_KBR_1805-08_5r.jpeg'
import React from "react";
import { getAnnotationsFromXml } from '../util/annotation-util'
import {
    TransformWrapper,
    TransformComponent, useTransformContext,
} from "react-zoom-pan-pinch";

import { useEffect, useRef, useState } from 'react';
import { Annotorious } from '@recogito/annotorious';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import Button from 'react-bootstrap/Button'
import '@recogito/annotorious/dist/annotorious.min.css';
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

function ImageComponent({onSelection, setSelection, transformComponentRef}) {
    // Ref for finding selected element
    const containerRef = useRef();
    const instance = useTransformContext();
    const [prevSelectedElementID, setPrevSelectedElementID] = useState(null);

    // Ref to the image DOM element
    const imgEl = useRef();


    // The current Annotorious instance
    const [ anno, setAnno ] = useState();

    const [imgURL, setImgURL] = useState('');

    // Init Annotorious when the component
    // mounts, and keep the current 'anno'
    // instance in the application state
    useEffect(() => {
        let annotorious = null;

        if (imgEl.current) {
            // Init
            annotorious = new Annotorious({
                image: imgEl.current,
                disableEditor: true,
                readOnly: true
            });

            annotorious.on('selectAnnotation', function(annotation, element) {
                setSelection(element.getAttribute('data-id'));
            });

            // TODO
            annotorious.on('cancelSelected', function(annotation) {
                // console.log(annotation)

                // console.log("canceled", annotation)
                if (annotorious.getSelected()) {
                    console.log(annotorious.getSelected().id, onSelection)
                    if (annotorious.getSelected().id === onSelection) {
                        console.log('equal')
                    }
                }
            })

            annotorious.loadAnnotations(createAnnotationUrl());
        }

        // Keep current Annotorious instance in state
        setAnno(annotorious);

        // Cleanup: destroy current instance
        return () => {
            annotorious.destroy();
        };
    }, []);

    // Handling selection coming from the text side
    useEffect(() => {
        if (anno) {
            anno.selectAnnotation(onSelection);

            if (transformComponentRef.current) {
                const { zoomToElement } = transformComponentRef.current;
                zoomToElement(containerRef.current?.querySelector(`[data-id="${onSelection}"]`), instance.transformState.scale);
                console.log(onSelection, 'itsme')
            }
        }
    }, [onSelection])


    useEffect(() => {
        const configuration = {
            method: "get",
            url: "https://axolotl-server-db50b102d293.herokuapp.com/image",
            headers: {
                "Authorization": `Bearer ${cookies.get("TOKEN")}`
            },
            responseType: 'blob'
        };
        axios(configuration)
            .then((response) => {
                setImgURL(URL.createObjectURL(response.data));
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    function createAnnotationUrl() {
        const annotationJson = getAnnotationsFromXml('path')
        const blob = new Blob([JSON.stringify(annotationJson)], {type: "application/json"})
        // const blob = new Blob([JSON.stringify('')], {type: "application/json"})
        return(URL.createObjectURL(blob));
    }

    return (
        <div className="annotation" ref={containerRef}>
            <TransformComponent wrapperStyle={{ maxWidth: "100%", height:"100%", overflow: "hidden"}}>

                {/*<img className=""*/}
                {/*ref={imgEl}*/}
                {/*src={imgURL}/>*/}

                <img className=""
                     ref={imgEl}
                     src={pic}/>

            </TransformComponent>
        </div>
    );
}

function AnnotationContainer({onSelection, setSelection}) {
    // Ref for zooming to element
    const transformComponentRef = useRef();

    return (
        <div className={"h-100 d-flex flex-column"}>
            <TransformWrapper
                initialScale={0.2} // TODO: calculate this based on image width and element width
                minScale={0.05}
                wheel={{disabled: false}}
                panning={{disabled: false}}
                limitToBounds={true}
                ref={transformComponentRef}
            >
                {({ zoomIn, zoomOut, resetTransform, centerView}) => (
                    <React.Fragment>
                        <div className="tools d-flex">
                            <Button variant="light" title={'zoom in'} onClick={() => zoomIn(0.1)}><FontAwesomeIcon icon={solid("magnifying-glass-plus")} /></Button>
                            <Button variant="light" title={'zoom out'} onClick={() => zoomOut(0.1)}><FontAwesomeIcon icon={solid("magnifying-glass-minus")} /></Button>
                            <Button variant="light" title={'reset zoom'} onClick={() => resetTransform()}><FontAwesomeIcon icon={solid("magnifying-glass")} /></Button>
                            <Button variant="light" title={'center view'} onClick={() => centerView()}><FontAwesomeIcon icon={solid("magnifying-glass-location")} /></Button>
                            <Button variant="light" title={'drag and move'} className={'drag-handle'}><FontAwesomeIcon icon={solid("up-down-left-right")} /></Button>

                        </div>
                        <ImageComponent onSelection={onSelection} setSelection={setSelection} transformComponentRef={transformComponentRef}/>

                    </React.Fragment>
                )}
            </TransformWrapper>
        </div>
    );
}


export default AnnotationContainer;

