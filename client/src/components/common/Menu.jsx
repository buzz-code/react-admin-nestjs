import { createElement } from 'react';
import { Menu, useResourceDefinitions, useGetResourceLabel, useCreatePath } from 'react-admin';
import DefaultIcon from '@mui/icons-material/ViewList';
import LabelIcon from '@mui/icons-material/Label';

const CustomMenu = ({ hasDashboard, ...props }) => {
    const resources = useResourceDefinitions();
    const getResourceLabel = useGetResourceLabel();
    const createPath = useCreatePath();

    return (
        <Menu>
            {hasDashboard && (
                <Menu.DashboardItem key="default-dashboard-menu-item" />
            )}
            {Object.keys(resources)
                .filter(name => resources[name].hasList)
                .map(name => (
                    <Menu.Item
                        key={name}
                        to={createPath({
                            resource: name,
                            type: 'list',
                        })}
                        state={{ _scrollToTop: true }}
                        primaryText={getResourceLabel(name, 2)}
                        leftIcon={
                            resources[name].icon ? (
                                createElement(resources[name].icon)
                            ) : (
                                <DefaultIcon />
                            )
                        }
                    />
                ))}
            <Menu.Item to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />
        </Menu>
    );
};

export default CustomMenu;