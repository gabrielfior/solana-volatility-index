import React from 'react';
import * as V from 'victory';

const data2 = [
    { quarter: 1, earnings: 13000 },
    { quarter: 2, earnings: 16500 },
    { quarter: 3, earnings: 14250 },
    { quarter: 4, earnings: 19000 },
    { quarter: 5, earnings: 21000 },
    { quarter: 6, earnings: 1000 }
];

import { useCallback } from "react"
import { Group } from "@visx/group";
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Line, LinePath } from "@visx/shape";
import { extent, bisector } from 'd3-array';
import { LinearGradient } from '@visx/gradient';
import { GridRows, GridColumns } from '@visx/grid';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GlyphCircle } from '@visx/glyph';

function Chart({ data }) {

    let tickCount = 3;
    let minImpliedVol = Math.min(...data.map(item => item.implied_volatility));
    let maxImpliedVol = Math.max(...data.map(item => item.implied_volatility));

   
    return (
        <>
            <V.VictoryChart
                theme={V.VictoryTheme.material}
                domain={{ y: [minImpliedVol - 0.1, maxImpliedVol + 0.1] }}
                height={400}
                width={700}
                containerComponent={
                    <V.VictoryVoronoiContainer />
                }
            >
                <V.VictoryLegend
                    orientation="horizontal"
                    colorScale={["red", "green"]}
                    gutter={20}
                    style={{ border: { stroke: "black" }, labels: { fill: 'white' } }}
                    data={[
                        { name: "BTC" }, { name: "SOL" }]}
                />

                <V.VictoryAxis
                    label={"Datetime"}
                    margin={{ top: 100, bottom: 600 }}
                    tickCount={tickCount}
                    tickFormat={(x) => new Date(x).toLocaleString('en-US')}
                />
                <V.VictoryAxis
                    dependentAxis
                    // tickFormat specifies how ticks should be displayed
                    //tickFormat={(x) => (`$${x / 1000}k`)}
                    label={"Implied volatility"}
                />

                {/* SOL */}
                <V.VictoryScatter
                    labelComponent={<V.VictoryTooltip />}
                    style={{ data: { fill: "red" } }}
                    size={5}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'SOL')}
                    labels={({ datum }) => `SOL IV: ${datum.implied_volatility.toFixed(2)} @ ${datum.current_datetime}`}
                />

                <V.VictoryLine
                    labelComponent={<V.VictoryTooltip />}
                    style={{
                        data: { stroke: "red", },
                        parent: { border: "1px solid #ccc" }
                    }}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'SOL')}
                />
                {/* BTC */}
                <V.VictoryScatter
                    style={{ data: { fill: "green" } }}
                    labelComponent={<V.VictoryTooltip />}
                    size={5}
                    y={"implied_volatility"}
                    x={d => d.current_datetime}
                    data={data.filter((d) => d.exchange === 'BTC')}
                    labels={({ datum }) => `BTC IV: ${datum.implied_volatility.toFixed(2)} @ ${datum.current_datetime}`}
                />
                <V.VictoryLine
                    style={{
                        data: { stroke: "green", },
                        parent: { border: "1px solid #ccc" }
                    }}
                    y={"implied_volatility"}
                    x={"current_datetime"}
                    data={data.filter((d) => d.exchange === 'BTC')}
                />

            </V.VictoryChart>

        </>
    )
}
export default Chart;
