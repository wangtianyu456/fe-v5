import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Table, Tooltip, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SelectedHosts from './SelectedHosts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { BusiGroupItem, CommonStoreState } from '@/store/commonInterface';

export default (props) => {
  const { allHosts, changeSelectedHosts, changeBusiGroup, onSearchHostName } = props;
  console.log('allHosts', allHosts);
  const { Option } = Select;
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([]);
  const [selectedHosts, setSelectedHosts] = useState<any[]>([]);
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [curBusiItemInHostSelect, setCurBusiItemInHostSelect] = useState<BusiGroupItem | undefined>(curBusiItem);
  const dispatch = useDispatch();
  const columns = [
    {
      title: '对象标识',
      dataIndex: 'ident',
      render: (t) => <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t}</div>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render(tagArr) {
        return (
          tagArr &&
          tagArr.map((item) => (
            <Tag color='blue' key={item}>
              {item}
            </Tag>
          ))
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'note',
      render: (t) => (
        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={t}>
          {t}
        </div>
      ),
    },
  ];
  useEffect(() => {
    const selectedHosts = allHosts.slice(0, 10);
    setSelectedHostsKeys(selectedHosts.map((h) => h.ident));
    setSelectedHosts(selectedHosts);
    changeSelectedHosts && changeSelectedHosts(selectedHosts);
  }, [allHosts.map((h) => h.id + '').join('')]);

  const busiGroupsInHostSelect = busiGroups.concat([{ id: 0, name: '未归组对象' } as BusiGroupItem]);
  let curSelectBusiGroup: string | undefined = undefined;
  if (curBusiItemInHostSelect) {
    curSelectBusiGroup = busiGroupsInHostSelect.find((bg) => bg.id === curBusiItemInHostSelect.id) ? String(curBusiItemInHostSelect.id) : undefined;
  }
  const selectBefore = (
    <div className='host-add-on'>
      <div className='title'>监控对象</div>
      <div className='select-before'>
        <Select
          allowClear
          placeholder='按业务组筛选'
          value={curSelectBusiGroup}
          style={{ width: '100%', textAlign: 'left' }}
          onChange={(busiItemId) => {
            let busiItemIdNum = Number(busiItemId);
            let data = busiGroups.find((bg) => bg.id === busiItemIdNum);
            if (busiItemIdNum === 0) {
              data = {
                id: 0,
                name: '未归组对象',
              } as BusiGroupItem;
            } else if (busiItemIdNum) {
              dispatch({
                type: 'common/saveData',
                prop: 'curBusiItem',
                data: data as BusiGroupItem,
              });
            }
            changeBusiGroup && changeBusiGroup(data);
            setCurBusiItemInHostSelect(data);
          }}
        >
          <Option key={0} value={'0'}>
            未归组对象
          </Option>
          {busiGroups.map((bg) => (
            <Option key={bg.id} value={String(bg.id)}>
              {bg.name}
            </Option>
          ))}
        </Select>
      </div>
      <SearchOutlined style={{ position: 'absolute', left: 190, zIndex: 2, top: 9 }} />
    </div>
  );
  return (
    <div className='host-select'>
      <div className='top-bar'>
        <Input
          placeholder='搜索，空格分隔多个关键字'
          addonBefore={selectBefore}
          className='host-input'
          onPressEnter={(e) => {
            const { value } = e.target as HTMLInputElement;
            onSearchHostName && onSearchHostName(value);
          }}
        />
      </div>
      <Table
        className={allHosts.length > 0 ? 'host-list' : 'host-list-empty'}
        rowKey='ident'
        rowSelection={{
          selectedRowKeys: selectedHostsKeys,
          onChange: (selectedRowKeys: string[], selectedRows) => {
            setSelectedHostsKeys(selectedRowKeys);
            setSelectedHosts(selectedRows);
            changeSelectedHosts && changeSelectedHosts(selectedRows);
          },
        }}
        columns={columns}
        dataSource={allHosts}
        pagination={{ simple: true }}
      ></Table>
      <div style={{ marginTop: -44 }}>
        <Button
          type='link'
          style={{ paddingRight: 4 }}
          onClick={() => {
            changeSelectedHosts(allHosts);
            setSelectedHosts(allHosts);
            setSelectedHostsKeys(allHosts.map((h) => h.ident));
          }}
        >
          全选所有
        </Button>
        |
        <SelectedHosts
          selectedHosts={selectedHosts}
          allHosts={allHosts}
          changeSelectedHosts={(selectedHosts) => {
            changeSelectedHosts(selectedHosts);
            setSelectedHosts(selectedHosts);
            setSelectedHostsKeys(selectedHosts.map((sh) => sh.ident));
          }}
        ></SelectedHosts>
      </div>
    </div>
  );
};
