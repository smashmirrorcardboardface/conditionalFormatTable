'use strict';

import 'core-js/stable';
import './../style/visual.less';
import powerbi from 'powerbi-visuals-api';
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { Grid } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

import { VisualSettings } from './settings';

export class Visual implements IVisual {
  private target: HTMLElement;
  private settings: VisualSettings;
  private data: any[];
  private tableContainer: HTMLElement;

  private camelize(text) {
    text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
    return text.substr(0, 1).toLowerCase() + text.substr(1);
  }

  private processDataToObjectArray = (categories) => {
    let objList = [];

    for (let i = 0; i < categories[0].values.length; i++) {
      let obj = {};
      for (let j = 0; j < categories.length; j++) {
        const asArray = Object.entries(categories[j].source.type);

        const categoryType = asArray.filter(
          ([key, value]) => value === true
        )[0][0];

        if (categoryType === 'dateTime') {
          obj[this.camelize(categories[j].source.displayName)] = new Date(
            categories[j].values[i].toString()
          ).toLocaleDateString('en-GB');
        } else {
          obj[this.camelize(categories[j].source.displayName)] =
            categories[j].values[i].toString();
        }
      }
      objList.push(obj);
    }
    return objList;
  };

  private addConditionalTableRowFormatting(table, data) {
    let rowCount = table.rows.length;
    for (let i = 0; i < rowCount; i++) {
      let row = table.rows[i];
      let cellCount = row.cells.length;
      for (let j = 0; j < cellCount; j++) {
        row.cells[j].style.backgroundColor = '#ffff00';
      }
    }
  }

  constructor(options: VisualConstructorOptions) {
    console.log('Visual constructor', options);
    this.target = options.element;

    this.tableContainer = document.createElement('div');
    this.tableContainer.setAttribute('id', 'tableContainer');
    this.target.appendChild(this.tableContainer);
  }

  public update(options: VisualUpdateOptions) {
    this.tableContainer.style.width = options.viewport.width + 'px';
    this.tableContainer.style.height = options.viewport.height + 'px';
    // this.tableContainer.style.overflow = 'auto';

    this.settings = Visual.parseSettings(
      options && options.dataViews && options.dataViews[0]
    );

    this.data = this.processDataToObjectArray(
      options.dataViews[0].categorical.categories
    );

    console.log(this.data);

    new Grid({
      columns: options.dataViews[0].categorical.categories.map(
        (category) => category.source.displayName
      ),
      data: this.data,
      width: options.viewport.width + 'px',
      fixedHeader: true,
      height: options.viewport.height - 8 + 'px',
      sort: true,
    }).render(this.tableContainer);

    //this.addConditionalTableRowFormatting(this.tableElement, this.data);
    console.log('Visual update', options);
  }

  private static parseSettings(dataView: DataView): VisualSettings {
    return <VisualSettings>VisualSettings.parse(dataView);
  }

  /**
   * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
   * objects and properties you want to expose to the users in the property pane.
   *
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions
  ): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
    return VisualSettings.enumerateObjectInstances(
      this.settings || VisualSettings.getDefault(),
      options
    );
  }
}
