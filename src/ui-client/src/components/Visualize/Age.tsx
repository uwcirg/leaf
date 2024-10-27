/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LabelList,
  Cell,
} from "recharts";
import { visualizationConfig } from "../../config/visualization";
import { PatientCountMap } from "../../models/cohort/DemographicDTO";

interface Props {
  counts: PatientCountMap;
  delay: number;
  height: number;
  width: number;
}

interface State {
  showAll: boolean;
  useDelay: boolean;
}

export class Age extends React.PureComponent<Props, State> {
  private className = "visualization-age";
  private maxWidth = 800;
  private defaultDataLength = 20;

  public constructor(props: Props) {
    super(props);
    this.state = {
      showAll: false,
      useDelay: true,
    };
  }

  public render() {
    const config = visualizationConfig.demographics.age;
    const { height, width, patientData, delay } = this.props;
    const { showAll, useDelay } = this.state;
    const c = this.className;
    const del = useDelay ? delay : 0;
    const w = width > this.maxWidth ? this.maxWidth : width;

    if (!patientData) return <div style={{margin: "24px"}}>No data available</div>;
    let data = Object.entries(this.formatData(patientData))
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => (a.value > b.value ? 0 : 1));
    const len = data.length;

    if (!showAll) {
      data = data.slice(0, this.defaultDataLength);
    }

    console.log(" age data ", data);
    return (
      <div className={`${c}-column`} style={{ height, width: w }}>
        {/* Show all toggle */}
        {len > this.defaultDataLength && (
          <div className="visualization-showall-toggle">
            <span
              className={`visualization-showall false ${
                showAll ? "" : "selected"
              }`}
              onClick={this.handleShowAllToggleClick.bind(null, false)}
            >{`Show top ${this.defaultDataLength} only`}</span>
            <span
              className={`visualization-showall true ${
                showAll ? "selected" : ""
              }`}
              onClick={this.handleShowAllToggleClick.bind(null, true)}
            >{`Show all ${len}`}</span>
          </div>
        )}

        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 30, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis dataKey="key" />
              <YAxis />
              <Bar
                animationBegin={del}
                barSize={config.barSize}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((d, i) => (
                  <Cell key={d.key} fill={this.color(i, config.colors)} />
                ))}
                <LabelList
                  dataKey="value"
                  formatter={this.formatNumber}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  private formatNumber = (val: any) => val.toLocaleString();
  private formatData = (data: []) => {
    if (!data) return null;
    const ageData = data.filter(o => !!o.age).map(o => o.age);
    let bracketData = {};
    bracketData["< 20"] = ageData.filter(n => parseInt(n) < 20).length;
    bracketData["20 - 29"] = ageData.filter(n => parseInt(n) >= 20 && parseInt(n) < 30).length;
    bracketData["30 - 39"] = ageData.filter(n => parseInt(n) >= 30 && parseInt(n) < 40).length;
    bracketData["40 - 49"] = ageData.filter(n => parseInt(n) >= 40 && parseInt(n) < 49).length;
    bracketData["50 - 59"] = ageData.filter(n => parseInt(n) >= 50 && parseInt(n) < 60).length;
    bracketData[">= 60"] = ageData.filter(n => parseInt(n) >= 60).length;
    return bracketData;
  };

  private color = (i: number, colors: string[]): string => {
    const last = colors.length - 1;
    if (i <= last) {
      return colors[i];
    }
    return colors[i - Math.floor(i / last) * last - 1];
  };

  private handleShowAllToggleClick = (showAll: boolean) => {
    this.setState({ showAll, useDelay: false });
  };
}
