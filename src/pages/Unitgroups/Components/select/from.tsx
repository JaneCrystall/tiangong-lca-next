import { langOptions } from '@/services/general/data';
import { getUnitGroupDetail } from '@/services/unitgroups/api';
import { genUnitGroupFromData } from '@/services/unitgroups/util';
import { ProFormInstance } from '@ant-design/pro-components';
import { Button, Card, Col, Divider, Form, Input, Row, Select, Space } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import UnitgroupsView from '../view';
import UnitgroupsSelectDrawer from './drawer';
// import LangTextItemFrom from '@/components/LangTextItem/from';
const { TextArea } = Input;

type Props = {
  name: any;
  label: string;
  lang: string;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
  onData: () => void;
};

const UnitgroupsSelectFrom: FC<Props> = ({ name, label, lang, formRef, onData }) => {
  const [id, setId] = useState<string | undefined>(undefined);

  const handletUnitgroupsData = (rowKey: any) => {
    getUnitGroupDetail(rowKey).then(async (result: any) => {
      const selectedData = genUnitGroupFromData(result.data?.json?.unitGroupDataSet ?? {});
      await formRef.current?.setFieldValue(name, {
        '@refObjectId': `${rowKey}`,
        '@type': 'unit group data set',
        '@uri': `../unitgroups/${rowKey}.xml`,
        'common:shortDescription':
          selectedData?.unitGroupInformation?.dataSetInformation?.['common:name'] ?? [],
      });
      onData();
    });
  };

  useEffect(() => {
    setId(formRef.current?.getFieldValue([...name, '@refObjectId']));
  });

  return (
    <Card size="small" title={label}>
      <Space direction="horizontal">
        <Form.Item label="Ref Object Id" name={[...name, '@refObjectId']}>
          <Input disabled={true} style={{ width: '300px' }} />
        </Form.Item>
        <Space direction="horizontal" style={{ marginTop: '6px' }}>
          <UnitgroupsSelectDrawer buttonType="text" lang={lang} onData={handletUnitgroupsData} />
          {id && <UnitgroupsView lang={lang} id={id} buttonType="text" />}
          {id && (
            <Button
              onClick={() => {
                formRef.current?.setFieldValue([...name], {});
                onData();
              }}
            >
              Clear
            </Button>
          )}
        </Space>
      </Space>
      <Form.Item label="Type" name={[...name, '@type']}>
        <Input disabled={true} />
      </Form.Item>
      <Form.Item label="URI" name={[...name, '@uri']}>
        <Input disabled={true} />
      </Form.Item>
      {/* <Form.Item label="Version" name={[...name, '@version']}>
        <Input disabled={true} />
      </Form.Item> */}
      <Divider orientationMargin="0" orientation="left" plain>
        Short Description
      </Divider>
      {/* <LangTextItemFrom
        name={[...name, 'common:shortDescription']}
        label="Short Description"
      /> */}
      <Form.Item>
        <Form.List name={[...name, 'common:shortDescription']}>
          {(subFields) => (
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16 }}>
              {subFields.map((subField) => (
                <Row key={subField.key}>
                  <Col flex="120px" style={{ marginRight: '10px' }}>
                    <Form.Item noStyle name={[subField.name, '@xml:lang']}>
                      <Select
                        placeholder="Select a lang"
                        optionFilterProp="lang"
                        options={langOptions}
                        disabled={true}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex="auto" style={{ marginRight: '10px' }}>
                    <Form.Item noStyle name={[subField.name, '#text']}>
                      <TextArea placeholder="text" rows={1} disabled={true} />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
              {subFields.length < 1 && <Input disabled={true} />}
            </div>
          )}
        </Form.List>
      </Form.Item>
    </Card>
  );
};

export default UnitgroupsSelectFrom;