/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
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

import { VisualSettings } from './settings';

import { Grid } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';

export class Visual implements IVisual {
  private target: HTMLElement;
  private settings: VisualSettings;
  private grid: Grid;
  private tableContainer: HTMLElement;

  private processData = (categories) => {
    let values = [];
    for (let i = 0; i < categories[0].values.length; i++) {
      let valueRow = [];
      for (let j = 0; j < categories.length; j++) {
        // debugger;

        const asArray = Object.entries(categories[j].source.type);

        const categoryType = asArray.filter(
          ([key, value]) => value === true
        )[0][0];

        console.log(categoryType);

        if (categoryType === 'dateTime') {
          valueRow.push(
            new Date(categories[j].values[i].toString()).toLocaleDateString(
              'en-GB'
            )
          );
        } else {
          valueRow.push(categories[j].values[i].toString());
        }
      }
      values.push(valueRow);
    }
    return values;
  };

  constructor(options: VisualConstructorOptions) {
    console.log('Visual constructor', options);
    this.target = options.element;

    this.tableContainer = document.createElement('div');
    this.tableContainer.setAttribute('id', 'tableContainer');

    this.target.appendChild(this.tableContainer);

    this.grid = new Grid({ data: [] }).render(
      document.querySelector('#tableContainer')
    );
  }

  public update(options: VisualUpdateOptions) {
    this.tableContainer.style.width = options.viewport.width + 'px';
    this.tableContainer.style.height = options.viewport.height + 'px';

    this.settings = Visual.parseSettings(
      options && options.dataViews && options.dataViews[0]
    );

    this.grid.updateConfig({
      columns: options.dataViews[0].categorical.categories.map(
        (category) => category.source.displayName
      ),
    });

    this.grid.updateConfig({
      data: this.processData(options.dataViews[0].categorical.categories),
    });

    this.grid.forceRender();

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
