import { supabase } from '@/services/supabase';
import { SortOrder } from 'antd/lib/table/interface';
import { classificationToString, genClassificationZH, getLangText, jsonToList } from '../general/util';
import { getILCDClassification } from '../ilcd/api';
import { genLifeCycleModelJsonOrdered } from './util';

export async function createLifeCycleModel(data: any) {
  const oldData = {
    lifeCycleModelDataSet: {
      '@xmlns': 'http://eplca.jrc.ec.europa.eu/ILCD/LifeCycleModel/2017',
      '@xmlns:acme': 'http://acme.com/custom',
      '@xmlns:common': 'http://lca.jrc.it/ILCD/Common',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@locations': '../ILCDLocations.xml',
      '@version': '1.1',
      '@xsi:schemaLocation':
        'http://eplca.jrc.ec.europa.eu/ILCD/LifeCycleModel/2017 ../../schemas/ILCD_LifeCycleModelDataSet.xsd',
    },
  };
  const newData = genLifeCycleModelJsonOrdered(data.id, data, oldData);
  const result = await supabase
    .from('lifecyclemodels')
    .insert([{ id: data.id, json_ordered: newData, json_tg: { xflow: data?.model } }])
    .select();
  return result;
}

export async function updateLifeCycleModel(data: any) {
  const result = await supabase.from('lifecyclemodels').select('id, json').eq('id', data.id);
  if (result.data && result.data.length === 1) {
    const oldData = result.data[0].json;
    const newData = genLifeCycleModelJsonOrdered(data.id, data, oldData);
    const updateResult = await supabase
      .from('lifecyclemodels')
      .update({ json_ordered: newData, json_tg: { xflow: data?.model } })
      .eq('id', data.id)
      .select();
    return updateResult;
  }
  return null;
}

export async function deleteLifeCycleModel(id: string) {
  const result = await supabase.from('lifecyclemodels').delete().eq('id', id);
  return result;
}

export async function getLifeCycleModelTableAll(
  params: {
    current?: number;
    pageSize?: number;
  },
  sort: Record<string, SortOrder>,
  lang: string,
  dataSource: string,
) {
  const sortBy = Object.keys(sort)[0] ?? 'modified_at';
  const orderBy = sort[sortBy] ?? 'descend';

  const selectStr = `
    id,
    json->lifeCycleModelDataSet->lifeCycleModelInformation->dataSetInformation->name->baseName,
    json->lifeCycleModelDataSet->lifeCycleModelInformation->dataSetInformation->classificationInformation->"common:classification"->"common:class",
    json->lifeCycleModelDataSet->lifeCycleModelInformation->dataSetInformation->"common:generalComment",
    version,
    modified_at
  `;

  let result: any = {};
  let query = supabase
    .from('lifecyclemodels')
    .select(selectStr, { count: 'exact' })
    .order(sortBy, { ascending: orderBy === 'ascend' })
    .range(
      ((params.current ?? 1) - 1) * (params.pageSize ?? 10),
      (params.current ?? 1) * (params.pageSize ?? 10) - 1,
    );
  if (dataSource === 'tg') {
    query = query.eq('state_code', 100);
  } else if (dataSource === 'my') {
    const session = await supabase.auth.getSession();
    query = query.eq('user_id', session?.data?.session?.user?.id);
  }

  result = await query;

  if (result.error) {
    console.log('error', result.error);
  }

  if (result.data) {
    if (result.data.length === 0) {
      return Promise.resolve({
        data: [],
        success: true,
      });
    }

    let data: any[] = [];
    if (lang === 'zh') {
      await getILCDClassification('LifeCycleModel', lang, ['all']).then((res) => {
        data = result.data.map((i: any) => {
          try {
            const classifications = jsonToList(i['common:class']);
            const classificationZH = genClassificationZH(classifications, res?.data);

            return {
              key: i.id,
              id: i.id,
              baseName: getLangText(i?.baseName, lang),
              generalComment: getLangText(i?.['common:generalComment'], lang),
              classification: classificationToString(classificationZH ?? {}),
              version: i?.version,
              modifiedAt: new Date(i?.modified_at),
            };
          } catch (e) {
            console.error(e);
            return {
              id: i.id,
            };
          }
        });
      });
    } else {
      data = result.data.map((i: any) => {
        try {
          return {
            key: i.id,
            id: i.id,
            baseName: getLangText(i?.baseName, lang),
            generalComment: getLangText(i?.['common:generalComment'], lang),
            classification: classificationToString(i['common:class'] ?? {}),
            version: i?.version,
            modifiedAt: new Date(i?.modified_at),
          };
        } catch (e) {
          console.error(e);
          return {
            id: i.id,
          };
        }
      });
    }

    return Promise.resolve({
      data: data,
      page: params.current ?? 1,
      success: true,
      total: result.count ?? 0,
    });
  }
  return Promise.resolve({
    data: [],
    success: false,
  });
}

export async function getLifeCycleModelDetail(id: string) {
  const result = await supabase.from('lifecyclemodels').select('json, json_tg').eq('id', id);
  if (result.data && result.data.length > 0) {
    const data = result.data[0];
    return Promise.resolve({
      data: {
        id: id,
        json: data.json,
        json_tg: data?.json_tg,
      },
      success: true,
    });
  }
  return Promise.resolve({
    data: {},
    success: true,
  });
}
