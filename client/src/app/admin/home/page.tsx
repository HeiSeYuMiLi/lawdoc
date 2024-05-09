'use client'

import "bulma"
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';
import React from 'react'
import { AdminNav } from '@/app/admin/nav'
import axios from 'axios';
import { getAdmin } from "@/app/parameter";
import * as echarts from 'echarts';

type TFileList = {
    id: number,
    file_type: string,
    create_time: string
}[];
type TUserList = {
    id: string,
    sex: number,
    create_time: string
}[];
const dateList = [
    ['2024-01-01', '二十', '元旦'],
    ['2024-01-02', '廿一'],
    ['2024-01-03', '廿二'],
    ['2024-01-04', '廿三'],
    ['2024-01-05', '廿四'],
    ['2024-01-06', '廿五', '小寒'],
    ['2024-01-07', '廿六'],
    ['2024-01-08', '廿七'],
    ['2024-01-09', '廿八', '三九天'],
    ['2024-01-10', '廿九'],
    ['2024-01-11', '正月', '腊月'],
    ['2024-01-12', '初二'],
    ['2024-01-13', '初三'],
    ['2024-01-14', '初四'],
    ['2024-01-15', '初五'],
    ['2024-01-16', '初六'],
    ['2024-01-17', '初七'],
    ['2024-01-18', '初八', '腊八节'],
    ['2024-01-19', '初九'],
    ['2024-01-20', '初十', '大寒'],
    ['2024-01-21', '十一'],
    ['2024-01-22', '十二'],
    ['2024-01-23', '十三'],
    ['2024-01-24', '十四'],
    ['2024-01-25', '十五'],
    ['2024-01-26', '十六'],
    ['2024-01-27', '十七', '五九天'],
    ['2024-01-28', '十八'],
    ['2024-01-29', '十九'],
    ['2024-01-30', '二十'],
    ['2024-01-31', '廿一'],
    ['2024-02-01', '廿二'],
    ['2024-02-02', '廿三'],
    ['2024-02-03', '廿四'],
    ['2024-02-04', '廿五', '立春'],
    ['2024-02-05', '廿六', '六九天'],
    ['2024-02-06', '廿七'],
    ['2024-02-07', '廿八'],
    ['2024-02-08', '廿九'],
    ['2024-02-09', '三十', '除夕'],
    ['2024-02-10', '初一', '春节'],
    ['2024-02-11', '初二'],
    ['2024-02-12', '初三'],
    ['2024-02-13', '初四'],
    ['2024-02-14', '初五', '情人节'],
    ['2024-02-15', '初六'],
    ['2024-02-16', '初七'],
    ['2024-02-17', '初八'],
    ['2024-02-18', '初九'],
    ['2024-02-19', '初十', '雨水'],
    ['2024-02-20', '十一'],
    ['2024-02-21', '十二'],
    ['2024-02-22', '十三'],
    ['2024-02-23', '十四', '八九天'],
    ['2024-02-24', '十五', '元宵'],
    ['2024-02-25', '十六'],
    ['2024-02-26', '十七'],
    ['2024-02-27', '十八'],
    ['2024-02-28', '十九'],
    ['2024-02-29', '二十'],
    ['2024-03-01', '廿一'],
    ['2024-03-02', '廿二'],
    ['2024-03-03', '廿三', '九九天'],
    ['2024-03-04', '廿四'],
    ['2024-03-05', '廿五', '惊蛰'],
    ['2024-03-06', '廿六'],
    ['2024-03-07', '廿七'],
    ['2024-03-08', '廿八', '妇女节'],
    ['2024-03-09', '廿九'],
    ['2024-03-10', '二月'],
    ['2024-03-11', '初二', '龙抬头'],
    ['2024-03-12', '初三', '植树节'],
    ['2024-03-13', '初四'],
    ['2024-03-14', '初五'],
    ['2024-03-15', '初六'],
    ['2024-03-16', '初七'],
    ['2024-03-17', '初八'],
    ['2024-03-18', '初九'],
    ['2024-03-19', '初十'],
    ['2024-03-20', '十一', '春分'],
    ['2024-03-21', '十二'],
    ['2024-03-22', '十三'],
    ['2024-03-23', '十四'],
    ['2024-03-24', '十五'],
    ['2024-03-25', '十六'],
    ['2024-03-26', '十七'],
    ['2024-03-27', '十八'],
    ['2024-03-28', '十九'],
    ['2024-03-29', '二十'],
    ['2024-03-30', '廿一'],
    ['2024-03-31', '廿二'],
    ['2024-04-01', '廿三', '愚人节'],
    ['2024-04-02', '廿四'],
    ['2024-04-03', '廿五'],
    ['2024-04-04', '廿六', '清明'],
    ['2024-04-05', '廿七'],
    ['2024-04-06', '廿八'],
    ['2024-04-07', '廿九'],
    ['2024-04-08', '三十'],
    ['2024-04-09', '三月'],
    ['2024-04-10', '初二'],
    ['2024-04-11', '初三'],
    ['2024-04-12', '初四'],
    ['2024-04-13', '初五'],
    ['2024-04-14', '初六'],
    ['2024-04-15', '初七'],
    ['2024-04-16', '初八'],
    ['2024-04-17', '初九'],
    ['2024-04-18', '初十'],
    ['2024-04-19', '十一', '谷雨'],
    ['2024-04-20', '十二'],
    ['2024-04-21', '十三'],
    ['2024-04-22', '十四'],
    ['2024-04-23', '十五'],
    ['2024-04-24', '十六'],
    ['2024-04-25', '十七'],
    ['2024-04-26', '十八'],
    ['2024-04-27', '十九'],
    ['2024-04-28', '二十'],
    ['2024-04-29', '廿一'],
    ['2024-04-30', '廿二'],
    ['2024-05-01', '廿三', '劳动节'],
    ['2024-05-02', '廿四'],
    ['2024-05-03', '廿五'],
    ['2024-05-04', '廿六'],
    ['2024-05-05', '廿七', '立夏'],
    ['2024-05-06', '廿八'],
    ['2024-05-07', '廿九'],
    ['2024-05-08', '四月'],
    ['2024-05-09', '初二'],
    ['2024-05-10', '初三'],
    ['2024-05-11', '初四'],
    ['2024-05-12', '初五', '母亲节'],
    ['2024-05-13', '初六'],
    ['2024-05-14', '初七'],
    ['2024-05-15', '初八'],
    ['2024-05-16', '初九'],
    ['2024-05-17', '初十'],
    ['2024-05-18', '十一'],
    ['2024-05-19', '十二'],
    ['2024-05-20', '十三', '小满'],
    ['2024-05-21', '十四'],
    ['2024-05-22', '十五'],
    ['2024-05-23', '十六'],
    ['2024-05-24', '十七'],
    ['2024-05-25', '十八'],
    ['2024-05-26', '十九'],
    ['2024-05-27', '二十'],
    ['2024-05-28', '廿一'],
    ['2024-05-29', '廿二'],
    ['2024-05-30', '廿三'],
    ['2024-05-31', '廿四'],
    ['2024-06-01', '廿五', '儿童节'],
    ['2024-06-02', '廿六'],
    ['2024-06-03', '廿七'],
    ['2024-06-04', '廿八'],
    ['2024-06-05', '廿九', '芒种'],
    ['2024-06-06', '十二'],
    ['2024-06-07', '十三'],
    ['2024-06-08', '十四'],
    ['2024-06-09', '十五'],
    ['2024-06-10', '十六'],
    ['2024-06-11', '十七'],
    ['2024-06-12', '十八'],
    ['2024-06-13', '十九'],
    ['2024-06-14', '二十'],
    ['2024-06-15', '廿一'],
    ['2024-06-16', '廿二'],
    ['2024-06-17', '廿三'],
    ['2024-06-18', '廿四'],
    ['2024-06-19', '廿五'],
    ['2024-06-20', '廿六'],
    ['2024-06-21', '廿七', '夏至'],
    ['2024-06-22', '廿八'],
    ['2024-06-23', '廿九'],
    ['2024-06-24', '六月'],
    ['2024-06-25', '初二'],
    ['2024-06-26', '初三'],
    ['2024-06-27', '初四'],
    ['2024-06-28', '初五'],
    ['2024-06-29', '初六'],
    ['2024-06-30', '初七'],
    ['2024-07-01', '初八'],
    ['2024-07-02', '初九'],
    ['2024-07-03', '初十'],
    ['2024-07-04', '十一'],
    ['2024-07-05', '十二'],
    ['2024-07-06', '十三'],
    ['2024-07-07', '十四', '小暑'],
    ['2024-07-08', '十五'],
    ['2024-07-09', '十六'],
    ['2024-07-10', '十七'],
    ['2024-07-11', '十八'],
    ['2024-07-12', '十九'],
    ['2024-07-13', '二十'],
    ['2024-07-14', '廿一'],
    ['2024-07-15', '廿二'],
    ['2024-07-16', '廿三'],
    ['2024-07-17', '廿四'],
    ['2024-07-18', '廿五'],
    ['2024-07-19', '廿六'],
    ['2024-07-20', '廿七'],
    ['2024-07-21', '廿八'],
    ['2024-07-22', '廿九', '大暑'],
    ['2024-07-23', '閏六'],
    ['2024-07-24', '初二'],
    ['2024-07-25', '初三'],
    ['2024-07-26', '初四'],
    ['2024-07-27', '初五'],
    ['2024-07-28', '初六'],
    ['2024-07-29', '初七'],
    ['2024-07-30', '初八'],
    ['2024-07-31', '初九'],
    ['2024-08-01', '初十'],
    ['2024-08-02', '十一'],
    ['2024-08-03', '十二'],
    ['2024-08-04', '十三'],
    ['2024-08-05', '十四'],
    ['2024-08-06', '十五'],
    ['2024-08-07', '十六', '立秋'],
    ['2024-08-08', '十七'],
    ['2024-08-09', '十八'],
    ['2024-08-10', '十九'],
    ['2024-08-11', '二十'],
    ['2024-08-12', '廿一'],
    ['2024-08-13', '廿二'],
    ['2024-08-14', '廿三'],
    ['2024-08-15', '廿四'],
    ['2024-08-16', '廿五'],
    ['2024-08-17', '廿六'],
    ['2024-08-18', '廿七'],
    ['2024-08-19', '廿八'],
    ['2024-08-20', '廿九'],
    ['2024-08-21', '三十'],
    ['2024-08-22', '七月'],
    ['2024-08-23', '初二', '處暑'],
    ['2024-08-24', '初三'],
    ['2024-08-25', '初四'],
    ['2024-08-26', '初五'],
    ['2024-08-27', '初六'],
    ['2024-08-28', '初七'],
    ['2024-08-29', '初八'],
    ['2024-08-30', '初九'],
    ['2024-08-31', '初十'],
    ['2024-09-01', '十一'],
    ['2024-09-02', '十二'],
    ['2024-09-03', '十三'],
    ['2024-09-04', '十四'],
    ['2024-09-05', '十五'],
    ['2024-09-06', '十六'],
    ['2024-09-07', '十七', '白露'],
    ['2024-09-08', '十八'],
    ['2024-09-09', '十九'],
    ['2024-09-10', '二十'],
    ['2024-09-11', '廿一'],
    ['2024-09-12', '廿二'],
    ['2024-09-13', '廿三'],
    ['2024-09-14', '廿四'],
    ['2024-09-15', '廿五'],
    ['2024-09-16', '廿六'],
    ['2024-09-17', '廿七'],
    ['2024-09-18', '廿八'],
    ['2024-09-19', '廿九'],
    ['2024-09-20', '八月'],
    ['2024-09-21', '初二'],
    ['2024-09-22', '初三'],
    ['2024-09-23', '初四', '秋分'],
    ['2024-09-24', '初五'],
    ['2024-09-25', '初六'],
    ['2024-09-26', '初七'],
    ['2024-09-27', '初八'],
    ['2024-09-28', '初九'],
    ['2024-09-29', '初十'],
    ['2024-09-30', '十一'],
    ['2024-10-01', '十二'],
    ['2024-10-02', '十三'],
    ['2024-10-03', '十四'],
    ['2024-10-04', '十五'],
    ['2024-10-05', '十六'],
    ['2024-10-06', '十七'],
    ['2024-10-07', '十八'],
    ['2024-10-08', '十九', '寒露'],
    ['2024-10-09', '二十'],
    ['2024-10-10', '廿一'],
    ['2024-10-11', '廿二'],
    ['2024-10-12', '廿三'],
    ['2024-10-13', '廿四'],
    ['2024-10-14', '廿五'],
    ['2024-10-15', '廿六'],
    ['2024-10-16', '廿七'],
    ['2024-10-17', '廿八'],
    ['2024-10-18', '廿九'],
    ['2024-10-19', '三十'],
    ['2024-10-20', '九月'],
    ['2024-10-21', '初二'],
    ['2024-10-22', '初三'],
    ['2024-10-23', '初四', '霜降'],
    ['2024-10-24', '初五'],
    ['2024-10-25', '初六'],
    ['2024-10-26', '初七'],
    ['2024-10-27', '初八'],
    ['2024-10-28', '初九'],
    ['2024-10-29', '初十'],
    ['2024-10-30', '十一'],
    ['2024-10-31', '十二'],
    ['2024-11-01', '十三'],
    ['2024-11-02', '十四'],
    ['2024-11-03', '十五'],
    ['2024-11-04', '十六'],
    ['2024-11-05', '十七'],
    ['2024-11-06', '十八'],
    ['2024-11-07', '十九', '立冬'],
    ['2024-11-08', '二十'],
    ['2024-11-09', '廿一'],
    ['2024-11-10', '廿二'],
    ['2024-11-11', '廿三'],
    ['2024-11-12', '廿四'],
    ['2024-11-13', '廿五'],
    ['2024-11-14', '廿六'],
    ['2024-11-15', '廿七'],
    ['2024-11-16', '廿八'],
    ['2024-11-17', '廿九'],
    ['2024-11-18', '十月'],
    ['2024-11-19', '初二'],
    ['2024-11-20', '初三'],
    ['2024-11-21', '初四'],
    ['2024-11-22', '初五', '小雪'],
    ['2024-11-23', '初六'],
    ['2024-11-24', '初七'],
    ['2024-11-25', '初八'],
    ['2024-11-26', '初九'],
    ['2024-11-27', '初十'],
    ['2024-11-28', '十一'],
    ['2024-11-29', '十二'],
    ['2024-11-30', '十三'],
    ['2024-12-01', '十四'],
    ['2024-12-02', '十五'],
    ['2024-12-03', '十六'],
    ['2024-12-04', '十七'],
    ['2024-12-05', '十八'],
    ['2024-12-06', '十九'],
    ['2024-12-07', '二十', '大雪'],
    ['2024-12-08', '廿一'],
    ['2024-12-09', '廿二'],
    ['2024-12-10', '廿三'],
    ['2024-12-11', '廿四'],
    ['2024-12-12', '廿五'],
    ['2024-12-13', '廿六'],
    ['2024-12-14', '廿七'],
    ['2024-12-15', '廿八'],
    ['2024-12-16', '廿九'],
    ['2024-12-17', '三十'],
    ['2024-12-18', '十一月'],
    ['2024-12-19', '初二'],
    ['2024-12-20', '初三'],
    ['2024-12-21', '初四'],
    ['2024-12-22', '初五', '冬至'],
    ['2024-12-23', '初六'],
    ['2024-12-24', '初七'],
    ['2024-12-25', '初八'],
    ['2024-12-26', '初九'],
    ['2024-12-27', '初十'],
    ['2024-12-28', '十一'],
    ['2024-12-29', '十二'],
    ['2024-12-30', '十三'],
    ['2024-12-31', '十四']
];

const getFileList = async () => {
    const token = getAdmin()
    const url = 'http://localhost:22222/lawdoc/admin/all_file_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {}, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const fileList: TFileList = data.data.files;
                return fileList;
            } else {
                alert(data.err_msg);
            }
        } else {
            alert('获取文件列表失败');
        }
    } catch (error) {
        console.error('获取文件列表失败：', error);
        alert('获取文件列表失败');
    }
    return [{
        'id': 0,
        'file_type': '',
        'create_time': ''
    }];
};

const getUserList = async () => {
    const token = getAdmin()
    const url = 'http://localhost:22222/lawdoc/admin/all_user_list';
    const config = {
        headers: {
            'Authorization': token
        }
    };

    try {
        const response = await axios.post(url, {}, config);

        if (response.status === 200) {
            const data = response.data;
            if (data.code === 0) {
                const userList: TUserList = data.data.users;
                return userList;
            } else {
                alert(data.err_msg);
            }
        } else {
            alert('获取用户列表失败');
        }
    } catch (error) {
        console.error('获取用户列表失败：', error);
        alert('获取用户列表失败');
    }
    return [{
        'id': '',
        'sex': 0,
        'create_time': ''
    }];
};

function countFileByMonth(month: string, fileList: TFileList) {
    let count = 0;
    fileList.forEach(json => {
        if (json['create_time'].slice(5, 7) === month)
            ++count;
    });
    return count;
}
function countFileByDate(date: string, fileList: TFileList) {
    let count = 0;
    fileList.forEach(json => {
        if (json['create_time'].slice(0, 10) === date)
            ++count;
    });
    return count;
}
function countFileByType(type: string, fileList: TFileList) {
    let count = 0;
    fileList.forEach(json => {
        if (json['file_type'] === type)
            ++count;
    });
    return count;
}
function countUserByMonth(month: string, userList: TUserList) {
    let count = 0;
    userList.forEach(json => {
        if (json['create_time'].slice(5, 7) === month)
            ++count;
    });
    return count;
}
function countUserByDate(date: string, userList: TUserList) {
    let count = 0;
    userList.forEach(json => {
        if (json['create_time'].slice(0, 10) === date)
            ++count;
    });
    return count;
}
function showChart(fileList: TFileList) {
    const myChart = echarts.init(document.getElementById('mychart') as HTMLDivElement);
    const option: echarts.EChartOption = {
        title: {
            text: '上半年文件数量统计表'
        },
        tooltip: {},
        legend: {
            data: ['数量']
        },
        xAxis: {
            data: ["一月", "二月", "三月", "四月", "五月", "六月"]
        },
        yAxis: {},
        series: [{
            name: '数量',
            type: 'bar',
            data: [countFileByMonth('01', fileList), countFileByMonth('02', fileList), countFileByMonth('03', fileList),
            countFileByMonth('04', fileList), countFileByMonth('05', fileList), countFileByMonth('06', fileList)]
        }]
    };
    myChart.setOption(option);
}
function showChart2(fileList: TFileList) {
    const myChart = echarts.init(document.getElementById('mychart2') as HTMLDivElement);
    const option = {
        title: {
            text: '文件类型数量统计表'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: '数量',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: countFileByType('txt', fileList), name: 'txt' },
                    { value: countFileByType('pdf', fileList), name: 'pdf' },
                    { value: countFileByType('png', fileList), name: 'png' },
                    { value: countFileByType('jpg', fileList), name: 'jpg' }
                ]
            }
        ]
    };

    myChart.setOption(option);
}
function showChart3(fileList: TFileList, month: string) {
    const heatmapData = [];
    const lunarData = [];
    for (let i = 0; i < dateList.length; i++) {
        heatmapData.push([dateList[i][0], countFileByDate(dateList[i][0], fileList)]);
        lunarData.push([dateList[i][0], 1, dateList[i][1], dateList[i][2]]);
    }
    const date = '2024-' + month.padStart(2, '0');

    const option = {
        title: {
            text: '文件数量日历统计表'
        },
        tooltip: {
            formatter: function (params: any) {
                return '数量: ' + params.value[1];
            }
        },

        visualMap: {
            show: false,
            min: 0,
            max: 5,
            calculable: true,
            seriesIndex: [2],
            orient: 'horizontal',
            left: 'center',
            bottom: 20,
            inRange: {
                color: ['#e0ffff', '#006edd'],
                opacity: 0.3
            },
            controller: {
                inRange: {
                    opacity: 0.5
                }
            }
        },

        calendar: [
            {
                left: 'center',
                top: 'middle',
                cellSize: [70, 70],
                yearLabel: { show: false },
                orient: 'vertical',
                dayLabel: {
                    firstDay: 1,
                    nameMap: 'cn'
                },
                monthLabel: {
                    show: false
                },
                range: date
            }
        ],

        series: [
            {
                type: 'scatter',
                coordinateSystem: 'calendar',
                symbolSize: 0,
                label: {
                    show: true,
                    formatter: function (params: any) {
                        var d = echarts.number.parseDate(params.value[0]);
                        return d.getDate() + '\n\n' + params.value[2] + '\n\n';
                    },
                    color: '#000'
                },
                data: lunarData,
                silent: true
            },
            {
                type: 'scatter',
                coordinateSystem: 'calendar',
                symbolSize: 0,
                label: {
                    show: true,
                    formatter: function (params: any) {
                        return '\n\n\n' + (params.value[3] || '');
                    },
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#a00'
                },
                data: lunarData,
                silent: true
            },
            {
                name: '数量',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: heatmapData
            }
        ]
    };
    const myChart = echarts.init(document.getElementById('mychart3') as HTMLDivElement);
    myChart.setOption(option);
}
function showChart4(userList: TUserList) {
    const option = {
        title: {
            text: '上半年用户数量统计表'
        },
        xAxis: {
            type: 'category',
            data: ["一月", "二月", "三月", "四月", "五月", "六月"]
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: [countUserByMonth('01', userList), countUserByMonth('02', userList), countUserByMonth('03', userList),
                countUserByMonth('04', userList), countUserByMonth('05', userList), countUserByMonth('06', userList),],
                type: 'line',
                smooth: true
            }
        ]
    };
    const myChart = echarts.init(document.getElementById('mychart4') as HTMLDivElement);
    myChart.setOption(option);
}

export default function Home() {
    const router = useRouter();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const [fileCount, setFileCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [todayFileCount, setTodayFileCount] = useState(0);
    const [todayUserCount, setTodayUserCount] = useState(0);
    const [selectMonth, setMonth] = useState(String(today.getMonth() + 1));

    const token = getAdmin()
    if (token === null || token === '') {
        router.replace('/user/login');
    }

    useEffect(() => {
        async function handleShowChart() {
            const fetchedData = await getFileList();
            showChart(fetchedData);
            showChart2(fetchedData);
            const fetchedData2 = await getUserList();
            showChart4(fetchedData2);
            setTodayFileCount(countFileByDate(formattedDate, fetchedData));
            setTodayUserCount(countUserByDate(formattedDate, fetchedData2));
            setFileCount(fetchedData.length);
            setUserCount(fetchedData2.length);
        }
        handleShowChart();
    }, []);
    useEffect(() => {
        async function handleShowChart() {
            const fetchedData = await getFileList();
            showChart3(fetchedData, selectMonth);
        }
        handleShowChart();
    }, [selectMonth]);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {AdminNav()}
            <main className="rightDiv">
                <div className="content">
                    <center>
                        <h1><strong>主页面</strong></h1>
                    </center>
                </div>
                <hr style={{ backgroundColor: "black" }} />
                <div style={{ width: "96%", margin: "auto" }}>
                    <div>
                        <label className="label">用户情况</label>
                        <div className="content">
                            <p>{year}年{month}月{day}日，今日新增了<strong>{todayUserCount}</strong>个用户，共<strong>{userCount}</strong>个用户</p>
                        </div>
                        <div>
                            <div id="mychart4" style={{ width: "800px", height: "360px" }}></div>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <label className="label" style={{ marginBottom: "25px" }}>文件情况</label>
                        <div className="content">
                            <p>{year}年{month}月{day}日，今日新增了<strong>{todayFileCount}</strong>个文件，共<strong>{fileCount}</strong>个文件</p>
                        </div>
                        <div>
                            <div id="mychart" style={{ width: "500px", height: "360px", float: "left", marginRight: "50px" }}></div>
                            <div id="mychart2" style={{ width: "300px", height: "360px", float: "inline-start" }}></div>
                            <div style={{ clear: "both" }}></div>
                        </div>
                        <div id="mychart3" style={{ width: "600px", height: "600px", float: "left", marginRight: "50px" }}></div>
                        <div className="field" style={{ float: "inline-start" }}>
                            <label className="label">选择月份</label>
                            <div className="control">
                                <div className="select">
                                    <select value={selectMonth} onChange={(e) => { setMonth(e.target.value) }}>
                                        {
                                            Array(today.getMonth() + 1).fill(0).map((_, index) => (
                                                <option>{index + 1}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
