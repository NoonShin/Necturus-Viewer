import React, {Fragment, useEffect, useRef, useState} from 'react'
import XMLViewer from 'react-xml-viewer'
import {Button} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {solid} from "@fortawesome/fontawesome-svg-core/import.macro";
import { scrollIntoView } from "seamless-scroll-polyfill";
import {convertZonesToJson} from "../util/annotation-util"


export function DynamicXMLViewer({onSelection, setSelection, currentPage, setAnnoZones}) {
    const [xmlText, setXmlText] = useState("");
    const [showRender, setShowRender] = useState(true);

    const onToolSelect = () => {
        setShowRender(!showRender);
    }

    useEffect(() => {
        const loadXmltext = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/files/xml/${currentPage}.xml`);
                const data = await response.text();
                setXmlText(data);
            }
            catch (e) {
             console.error(e)
            }
        };
        if (!currentPage) setXmlText('');
        else loadXmltext();
    }, [currentPage]);

    return (
        <Fragment>
            <div className="h-100 d-flex flex-column">
                <div className="d-flex tools">
                    <Button variant="light" title={'export XML'} onClick><FontAwesomeIcon icon={solid("file-export")} /></Button>
                    <Button variant="light" title={'drag and move'} className={'drag-handle'}><FontAwesomeIcon icon={solid("up-down-left-right")} /></Button>

                    <span className="ms-auto p-2 d-inline-flex">
                        <div className="switcher" onChange={onToolSelect}>
                              <input type="radio" name="view-toggle" value="raw" id="raw" className="switcherxml__input switcherxml__input--raw" />
                              <label htmlFor="raw" className="switcher__label">Raw</label>

                              <input type="radio" name="view-toggle" value="render" id="render" className="switcherxml__input switcherxml__input--render" defaultChecked />
                              <label htmlFor="render" className="switcher__label">Render</label>

                              <span className="switcher__toggle"></span>
                        </div>

                    </span>
                </div>
                <div className={"xml-container"}>
                    {showRender ? (
                        <XmlHtmlRenderer xmlString={xmlText} onSelection={onSelection} setSelection={setSelection} setAnnoZones={setAnnoZones} />
                    ) : (
                        <XMLViewer collapsible="true" initalCollapsedDepth="3" xml={xmlText} />
                    )}
                </div>

            </div>
        </Fragment>

    )
}

const XmlHtmlRenderer = ({ xmlString, onSelection, setSelection, setAnnoZones }) => {
    const [xmlHtml, setXmlHtml] = useState(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [prevSelectedElement, setPrevSelectedElement] = useState(null);
    const containerRef = useRef(null);

    // if user selects from the text
    const handleClick = (e) => {
        if (e.target.getAttribute('facs')) setSelection(e.target.getAttribute('facs').slice(1))
    }

    useEffect(() => {
        if (!xmlString) {
            return;
        }
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

        const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
        if (parseError) {
            setXmlHtml(
                <Fragment>
                <p>The XML document has the following error and cannot be rendered:</p>
                <p>{parseError.querySelector('div').textContent.trim()}</p>
                </Fragment>)
            return;
        }

        const extractZones = (doc) => {
            const zones = doc.getElementsByTagName('zone');
            setAnnoZones(convertZonesToJson(zones));
        }

        // Convert the XML DOM into React elements
        const renderXmlAsReact = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.nodeValue;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();

                if (tagName === 'teiheader' ||
                    tagName === 'facsimile' ||
                    tagName === 'pb') {
                    return '';
                }

                const children = Array.from(node.childNodes).map((child) => renderXmlAsReact(child));
                const attributes = Array.from(node.attributes).reduce((acc, { name, value }) => {
                    if (name === 'facs') acc['key'] = value;
                    if (name === 'style') {
                        // TODO: Transform the style appropriately
                        return acc;
                    }
                    acc[name] = value;
                    return acc;
                }, {});

                if (tagName === 'tei' ||
                    tagName === 'body' ||
                    tagName === 'lg' ||
                    tagName === 'text') {
                    return <Fragment>{children}</Fragment>
                }

                if (tagName === 'l') {
                    return <Fragment><span {...attributes}>{children}</span><br/></Fragment>
                }

                if (tagName === 'unclear') {
                    return <Fragment><span attr="unclear" {...attributes}>{children}</span></Fragment>
                }

                if (tagName === 'lb') {
                    return <Fragment><span {...attributes}/><br/></Fragment>
                }

                return React.createElement(node.tagName.toLowerCase(), {...attributes}, children);
            }

            return null;
        };

        extractZones(xmlDoc);
        const xmlHtml = renderXmlAsReact(xmlDoc.documentElement);
        setXmlHtml(xmlHtml);
    }, [xmlString]);

    useEffect(() => {
        if (!xmlString) return;
        setSelectedElement(containerRef.current?.querySelector(`[facs="#${onSelection}"]`))
    }, [onSelection])

    useEffect(() => {
        if (prevSelectedElement) prevSelectedElement.classList.remove("highlighted");
        if (selectedElement) {
            selectedElement.classList.add("highlighted");
            scrollIntoView(selectedElement, {block: "nearest", inline: "nearest"});
            setPrevSelectedElement(selectedElement);
        }
    }, [selectedElement])

    return <div ref={containerRef} onClick={handleClick} className={"xml-container"}>{xmlHtml}</div>;
};