import React, {Fragment, useEffect, useRef, useState} from 'react'
import XMLViewer from 'react-xml-viewer'
import xmlFile from './../assets/oxen.xml'
import {SearchCursor} from "@codemirror/search";
import {syntaxTree} from "@codemirror/language";
import {EditorSelection} from "@codemirror/state";

export function DynamicXMLViewer(onSelection) {
    const [xmlText, setXmlText] = useState("");
    const [showRender, setShowRender] = useState(true);

    const onToolSelect = () => {
        setShowRender(!showRender);
    }

    useEffect(() => {
        fetch(xmlFile)
            .then(response => response.text())
            .then(data => {
                setXmlText(data)
            })
    });

    return (
        <Fragment>
            <div className="h-100 d-flex flex-column xml-container">
                <div className="d-flex">
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
                {showRender ? (
                    <XmlHtmlRenderer xmlString={xmlText} onSelection={onSelection} />
                ) : (
                    <XMLViewer collapsible="true" initalCollapsedDepth="3" xml={xmlText} />
                )

                }

            </div>
        </Fragment>

    )
}

const XmlHtmlRenderer = ({ xmlString, onSelection }) => {
    const [xmlHtml, setXmlHtml] = useState(null);
    const containerRef = useRef(null);

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

        const xmlHtml = renderXmlAsReact(xmlDoc.documentElement);
        setXmlHtml(xmlHtml);
    }, [xmlString]);

    useEffect(() => {
        if (!onSelection || !xmlString) return;
        // TODO: why is this in two levels?
        console.log(onSelection.onSelection)
        const element = containerRef.current.querySelector(`[facs="#${onSelection.onSelection}"]`)
        console.log(element)
    }, [onSelection])

    return <div ref={containerRef}>{xmlHtml}</div>;
};