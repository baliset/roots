import React, {useCallback, useRef} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.min.css';
import 'react-contexify/ReactContexify.css';

import {CheckboxRenderer} from '../agstuff/CheckboxRenderer';
import {DiffRenderer} from "../agstuff/DiffRenderer";



const frameworkComponents = {
    checkboxRenderer:CheckboxRenderer,
    diffRenderer:DiffRenderer,
};

export const  MyGrid = ({children, style, contextM, rowData, columnDefs,  getRowNodeId, dark=true}) => {
    const gridRef = useRef(null);
    const ready = useCallback(e=>{console.log(`ready event`, e)},[]);

    const gridOptions = {suppressPropertyNamesCheck : true};
    const className = `ag-theme-balham${dark? '-dark':''}`;
    return (
        <div  className={className} style={style}>
            {children}
            <AgGridReact
                enableRtl={true}
                onCellContextMenu={contextM}
                onGridReady={ready}
                ref={gridRef}
                components={frameworkComponents}
                gridOptions={gridOptions}
                toolPanel={'columns'}
                showToolPanel={true}
                reactNext={true}
                getRowNodeId={getRowNodeId}
                columnDefs={columnDefs} rowData={rowData}/>
        </div>
    );
}
