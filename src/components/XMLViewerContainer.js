import {Fragment, useState} from "react";
import * as AppUtil from "../util/app-util";
import Container from "react-bootstrap/Container";
import AnnotationContainer from "./AnnotationContainer";
import {Responsive, WidthProvider} from "react-grid-layout";
import Cookies from "universal-cookie";
import {CustomNavbar} from "./CustomNavbar";
import {ImportModal} from "./ImportModal";
import {DynamicXMLViewer} from "./DynamicXMLViewer";
const cookies = new Cookies();


const ResponsiveGridLayout = WidthProvider(Responsive);

export function XMLViewerContainer() {
    const [selectedZone, setSelectedZone] = useState("");
    const [layout, setLayout] = useState(AppUtil.sideBySideLayout);

    const [show, setShow] = useState(false);

    function resetLayout(newLayout) {
        if (newLayout === 'sbs') {
            setLayout(AppUtil.sideBySideLayout)
        }
        else if (newLayout === 'fw') {
            setLayout(AppUtil.fullWidthLayout)
        }
    }

    function onLayoutChange(layout, layouts) {
        setLayout(layouts)
    }

    function handleLogout() {
        cookies.remove("TOKEN", { path: "/" });
        window.location.href = '/'
    }

    function transkribusModal() {
        setShow(!(show));
    }


    return (
        <Fragment>
            <CustomNavbar loggedIn={true} helperFunctions={{transkribusModal, resetLayout, handleLogout}} />
            <Container>
                <ImportModal show={show} switchShow={transkribusModal} />
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layout}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={130}
                    draggableHandle=".drag-handle"
                    onLayoutChange={(layout, layouts) =>
                        onLayoutChange(layout, layouts)
                    }
                >
                    <div key="1">
                        <div className="border bg-light h-100 p-3">
                            <DynamicXMLViewer onSelection={selectedZone} setSelection={setSelectedZone} />
                        </div>
                    </div>
                    <div key="2">
                        <div className="border bg-light h-100 p-3">
                            <AnnotationContainer onSelection={selectedZone} setSelection={setSelectedZone}/>
                        </div>
                    </div>

                </ResponsiveGridLayout>
            </Container>
        </Fragment>
    )
}