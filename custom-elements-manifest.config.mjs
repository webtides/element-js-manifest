/**
 * MEMBER-DENY-LIST
 *
 * Excludes members from the manifest
 */
function memberDenyListPlugin() {
    const MEMBER_DENY_LIST = ['properties', 'styles'];

    return {
        name: 'element-js - MEMBER-DENY-LIST',
        moduleLinkPhase({moduleDoc}){
            const classes = moduleDoc?.declarations?.filter(declaration => declaration.kind === 'class');

            classes?.forEach(klass => {
                if(!klass?.members) return;
                klass.members = klass?.members?.filter(member => !MEMBER_DENY_LIST.includes(member.name));
            });
        },
    }
}

/**
 * METHOD-DENY-LIST
 *
 * Excludes methods from the manifest
 */
function methodDenyListPlugin() {
    const METHOD_DENY_LIST = ['connected', 'beforeUpdate', 'afterUpdate', 'disconnected', 'requestUpdate', 'watch', 'events', 'template'];

    return {
        name: 'element-js - METHOD-DENY-LIST',
        moduleLinkPhase({moduleDoc}){
            const classes = moduleDoc?.declarations?.filter(declaration => declaration.kind === 'class');

            classes?.forEach(klass => {
                if(!klass?.members) return;
                klass.members = klass?.members?.filter(member => !METHOD_DENY_LIST.includes(member.name));
            });
        },
    }
}

import { createAttributeFromField } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createAttribute.js';
import { getDefaultValuesFromConstructorVisitor } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createClass.js';
import { handleJsDoc } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/handlers.js';
import {
    isAlsoAttribute,
    hasStaticKeyword,
    getPropertiesObject,
    getAttributeName,
    reflects,
} from './utils.js';

import { extractMixinNodes, isMixin } from '@custom-elements-manifest/analyzer/src/utils/mixins.js';
import { handleName } from '@custom-elements-manifest/analyzer/src/features/analyse-phase/creators/createMixin.js';

/**
 * STATIC-PROPERTIES
 *
 * Handles `static get properties()` and `static properties`
 */
function staticPropertiesPlugin() {
    return {
        name: 'element-js - STATIC-PROPERTIES',
        analyzePhase({ ts, node, moduleDoc, context }) {
            // console.log('analyzePhase');
            // console.log({ node, moduleDoc, context });
            switch (node.kind) {
                case ts.SyntaxKind.VariableStatement:
                case ts.SyntaxKind.FunctionDeclaration:
                    if (isMixin(node)) {
                        const { mixinFunction, mixinClass } = extractMixinNodes(node);
                        const { name } = handleName({}, mixinFunction);
                        handleStaticProperties(mixinClass, moduleDoc, context, name);
                    }
                    break;

                case ts.SyntaxKind.ClassDeclaration:
                    handleStaticProperties(node, moduleDoc, context);
                    break;
            }
        },
    };
}

function handleStaticProperties(classNode, moduleDoc, context, mixinName = null) {
    //console.log('handleStaticProperties');
    // console.log({classNode});
    let className;
    if (!mixinName) {
        className = classNode?.name?.getText();
    } else {
        className = mixinName;
    }
    const currClass = moduleDoc?.declarations?.find(declaration => declaration.name === className);

    classNode?.members?.forEach(member => {
        //console.log('forEach(member', member.name.text);
        if (member.name?.text === 'properties') {
            const propertiesObject = getPropertiesObject(member);
            //console.log('propertiesObject', propertiesObject);

            propertiesObject?.properties?.forEach(property => {
                let classMember = {
                    kind: 'field',
                    name: property?.name?.getText() || '',
                    privacy: 'public',
                };
                classMember = handleJsDoc(classMember, property);

                const memberIndex = currClass?.members?.findIndex(field => field.name === classMember.name);
                if (memberIndex >= 0) {
                    classMember = { ...classMember, ...currClass.members[memberIndex] };
                }

                if (isAlsoAttribute(property)) {
                    const attribute = createAttributeFromField(classMember);

                    /**
                     * If an attribute name is provided
                     * @example @property({attribute:'my-foo'})
                     */
                    const attributeName = getAttributeName(property);
                    if (attributeName) {
                        attribute.name = attributeName;
                        classMember.attribute = attributeName;
                    } else {
                        classMember.attribute = classMember.name;
                    }

                    if (reflects(property)) {
                        classMember.attribute = attribute.name;
                        classMember.reflects = true;
                    }

                    const attributeIndex = currClass?.attributes?.findIndex(
                        attr => attr.name === attribute.name,
                    );
                    if (attributeIndex >= 0) {
                        currClass.attributes[attributeIndex] = {
                            ...currClass.attributes[attributeIndex],
                            ...attribute,
                        };
                    } else {
                        currClass.attributes.push(attribute);
                    }
                }

                if (memberIndex >= 0) {
                    currClass.members[memberIndex] = classMember;
                } else {
                    currClass.members.push(classMember);
                }
            });
            return;
        }
    });

    /** Get default values */
    getDefaultValuesFromConstructorVisitor(classNode, currClass, context);
}

export default {
    plugins: [
        methodDenyListPlugin(),
        memberDenyListPlugin(),
        staticPropertiesPlugin(),
    ]
}
