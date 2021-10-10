import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, List, Space, Typography } from 'antd';
import ResponsiveCont from 'components/ResponsiveCont';
import { Size } from 'constants/layout';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
  useParams,
} from 'react-router';
import SampleKStartup from './SampleWorksheetSubroutes/SampleKStartup';

const margin = Size.margin;

type WorksheetParam = {
  title: string | undefined;
  chapter: string | undefined;
  page: string | undefined;
};

type Sample = {
  title: string;
  chapter: number;
  page: number;
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>
    | undefined;
};

const sampleList: Sample[] = [
  {
    title: 'k-startup',
    chapter: 1,
    page: 1,
    component: SampleKStartup,
  },
];

export default function SampleWorksheetRoute() {
  const { title } = useParams<WorksheetParam>();
  const history = useHistory();

  if (title === undefined) {
    return (
      <ResponsiveCont>
        <SelectSampleWorksheet></SelectSampleWorksheet>
      </ResponsiveCont>
    );
  }

  return (
    <Space direction="vertical" size={30}>
      <ResponsiveCont>
        <Space
          direction="horizontal"
          size={8}
          style={{
            marginTop: 30,
          }}
          align="center"
        >
          <Button
            type="text"
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              history.push('/sampleWorksheet');
            }}
          ></Button>
          <Typography.Text
            style={{
              fontSize: 16,
            }}
          >
            {title}
          </Typography.Text>
        </Space>
      </ResponsiveCont>
      <Switch>
        {sampleList.map((sample) => (
          <Route
            path={`/sampleWorksheet/${sample.title}/:chapter/:page`}
            component={sample.component}
          ></Route>
        ))}
        <Redirect to="/sampleWorksheet"></Redirect>
      </Switch>
    </Space>
  );
}

function SelectSampleWorksheet() {
  return (
    <ResponsiveCont>
      <Space
        direction="vertical"
        size={margin}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      >
        <Typography.Text
          style={{
            fontSize: 16,
          }}
        >
          Select Worksheet
        </Typography.Text>
        <List
          grid={{
            column: 2,
            gutter: 10,
          }}
          dataSource={sampleList}
          renderItem={(item: Sample) => (
            <List.Item>
              <Card
                title={
                  <Typography.Link
                    href={`/sampleWorksheet/${item.title}/${item.chapter}/${item.page}`}
                  >
                    {item.title}
                  </Typography.Link>
                }
              >
                <Typography.Text>샘플 Worksheet를 확인합니다.</Typography.Text>
              </Card>
            </List.Item>
          )}
        ></List>
      </Space>
    </ResponsiveCont>
  );
}
