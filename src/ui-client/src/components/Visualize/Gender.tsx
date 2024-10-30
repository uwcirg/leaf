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

export class Gender extends React.PureComponent<Props, State> {
  private className = "visualization-gender";
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
    const config = visualizationConfig.demographics.gender;
    const { height, width, counts, delay } = this.props;
    const { showAll, useDelay } = this.state;
    const c = this.className;
    const del = useDelay ? delay : 0;
    const w = width > this.maxWidth ? this.maxWidth : width;

    if (!counts) return <div className="visualization-no-data-container">No data available</div>;
    let data = Object.entries(counts??{})
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => (a.value > b.value ? 0 : 1));
    const len = data.length;

    if (!showAll) {
      data = data.slice(0, this.defaultDataLength);
    }

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
              layout="vertical"
            >
              <XAxis type="number" allowDecimals={false} hide={true}/>
              <YAxis dataKey="key" type="category" interval={0} width={150} />
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
                  position="right"
                />
                <LabelList
                  dataKey="key"
                  formatter={this.formatKey}
                  position="left"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  private formatNumber = (val: any) => val.toLocaleString();
  private formatKey = (val: string) => {
    const displayValue = {
      cisman: "cis-man",
      ciswoman: "cis-woman",
      transwoman: "trans-woman",
      transman: "trans-man",
      fab: "nonbinary/other (assigned female at birth)",
      mab: "nonbinary/other (assigned male at birth)",
    }[String(val).toLowerCase().replace(/[-_]/g, "")];
    if (displayValue) return displayValue;
    return val?.replace(/[-_]/g, " ")??"other";
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
