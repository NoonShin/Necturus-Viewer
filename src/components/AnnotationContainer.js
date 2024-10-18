import React, { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import * as Annotorious from '@recogito/annotorious-openseadragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Button from 'react-bootstrap/Button';
import '@recogito/annotorious/dist/annotorious.min.css';
import '@recogito/annotorious-openseadragon/dist/annotorious.min.css';
import Cookies from "universal-cookie";
const cookies = new Cookies();

function ImageComponent({ onSelection, setSelection, currentPage, annoZones, setViewer }) {
    const viewerRef = useRef();
    const [anno, setAnno] = useState(null);
    const [imgURL, setImgURL] = useState('');
    const [selectionThruImg, setSelectionThruImg] = useState(null);

    const handleAnnoClick = (e) => {
        if (e.target.tagName !== 'polygon')
            // setSelection('');
            console.log(e.target)
    };

    function createAnnotationUrl() {
        try {
            if (!Array.isArray(annoZones)) {
                console.error('annoZones is not an array:', annoZones);
                return '';
            }
            const blob = new Blob([JSON.stringify(annoZones)], { type: 'application/json' });
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error('Error creating annotation URL:', e);
            return '';
        }
    }

    useEffect(() => {
        if (viewerRef.current && imgURL) {
            const viewer = OpenSeadragon({
                element: viewerRef.current,
                showNavigationControl: false,
                tileSources: {
                    type: 'image',
                    url: imgURL,
                },
            });

            viewer.setControlsEnabled(false)

            const config = {
                allowEmpty: true,
                disableEditor: true,
                readOnly: true
            }

            const annotorious = Annotorious(viewer, config);

            annotorious.on('selectAnnotation', function(annotation, element) {
                setSelection(element.getAttribute('data-id'));
                // setSelectionThruImg(element.getAttribute('data-id'));
                console.log(element.getAttribute('data-id'))
            });

            // annotorious.on('cancelSelected', function(selection) {
            //    setSelection('');
            // });

            if (annoZones) annotorious.loadAnnotations(createAnnotationUrl());

            setAnno(annotorious);
            setViewer(viewer);


            return () => {
                if (anno) anno.destroy();
                viewer.destroy();
            };
        }
    }, [imgURL, annoZones]);

    useEffect(() => {
        if (anno && onSelection) {
            // if (onSelection !== selectionThruImg) {
                console.log("in", onSelection)
                anno.selectAnnotation(onSelection);
                anno.panTo(onSelection)
            // }
        }
    }, [onSelection]);

    useEffect(() => {
        if (!currentPage) {
            setImgURL('');
        } else {
            setImgURL(`${process.env.PUBLIC_URL}/files/img/${currentPage}.jpg`);
        }
    }, [currentPage]);

    return (
        <div className="annotation" ref={viewerRef} onClick={handleAnnoClick} style={{ width: '100%', height: '100%' }}></div>
    );
}

function AnnotationContainer({ onSelection, setSelection, currentPage, annoZones }) {
    const [viewer, setViewer] = useState(null);

    const zoomIn = () => {
        if (viewer) viewer.viewport.zoomBy(1.2);
    };

    const zoomOut = () => {
        if (viewer) viewer.viewport.zoomBy(0.8);
    };

    const resetZoom = () => {
        if (viewer) viewer.viewport.goHome();
    };

    const centerView = () => {
        if (viewer) viewer.viewport.panTo(viewer.viewport.getCenter(true));
    };

    return (
        <div className="h-100 d-flex flex-column">
            <div className="tools d-flex">
                <Button variant="light" title="Zoom In" onClick={zoomIn}>
                    <FontAwesomeIcon icon={solid('magnifying-glass-plus')} />
                </Button>
                <Button variant="light" title="Zoom Out" onClick={zoomOut}>
                    <FontAwesomeIcon icon={solid('magnifying-glass-minus')} />
                </Button>
                <Button variant="light" title="Reset Zoom" onClick={resetZoom}>
                    <FontAwesomeIcon icon={solid('magnifying-glass')} />
                </Button>
                <Button variant="light" title="Center View" onClick={centerView}>
                    <FontAwesomeIcon icon={solid('magnifying-glass-location')} />
                </Button>
                <Button variant="light" title="Drag and Move" className="drag-handle">
                    <FontAwesomeIcon icon={solid('up-down-left-right')} />
                </Button>
            </div>
            <ImageComponent
                onSelection={onSelection}
                setSelection={setSelection}
                currentPage={currentPage}
                annoZones={annoZones}
                setViewer={setViewer}
            />
        </div>
    );
}

export default AnnotationContainer;