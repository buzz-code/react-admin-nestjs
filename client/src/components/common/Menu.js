import { createElement } from 'react';
import { Menu, useResourceDefinitions } from 'react-admin';
import LabelIcon from '@mui/icons-material/Label';

const CustomMenu = () => {
    const resources = useResourceDefinitions();
    
    return (
        <Menu>
            {Object.keys(resources).map(name => (
                <Menu.Item
                    key={name}
                    to={`/${name}`}
                    primaryText={resources[name].options && resources[name].options.label || name}
                    leftIcon={createElement(resources[name].icon)}
                />
            ))}
            <Menu.Item to="/yemot-simulator" primaryText="סימולטור" leftIcon={<LabelIcon />} />
        </Menu>
    );
};

export default CustomMenu;