import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { Squid } from '@0xsquid/sdk';

export class SquidRouter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Squid Router',
		name: 'squidRouter',
		group: ['transform', 'output'],
		version: 1,
		description: 'Squid Router action',
		icon: 'file:SquidRouter.svg',
		defaults: {
			name: 'Squid Router action',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'squidApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				options: [
					{
						name: 'Build Swap Route',
						value: 'route',
					},
					{
						name: 'Execute Swap',
						value: 'execute',
					},
					{
						name: 'Get Swap Status',
						value: 'status',
					},
					{
						name: 'List Chains',
						value: 'chains',
					},
					{
						name: 'List Tokens',
						value: 'tokens',
					},
				],
				default: 'route',
				required: true,
				description: 'Format of the response output',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const outputs = [];
		const items = this.getInputData();
		const { integrator } = await this.getCredentials('squidApi');
		const squid = new Squid({
			baseUrl: 'https://apiplus.squidrouter.com',
			// @ts-ignore
			integratorId: integrator,
			// headers: {
			// 	'Content-Type': ''
			// },
		});
		// const response = await this.helpers.httpRequest({
		// 	url: 'https://apiplus.squidrouter.com/v2/sdk-info',
		// 	method: 'GET',
		// 	// disableFollowRedirect: true,
		// 	json: true,
		// 	headers: {
		// 		'x-integrator-id': integrator
		// 	}
		// });
		// console.log(response);
		await squid.init();
		for (let index = 0; index < items.length; index++) {
			// const item: INodeExecutionData = items[itemIndex];
			try {
				const action = this.getNodeParameter('action', index, '') as string;
				switch (action) {
					case 'route':
						break;
					case 'execute':
						break;
					case 'status':
						break;
					case 'chains':
						for (const json of squid.chains) {
							outputs.push({ json });
						}
						break;
					case 'tokens':
						for (const json of squid.tokens) {
							outputs.push({ json });
						}
						break;
					default:
						// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown
						throw new Error(`Unsupported action: ${action}`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const [{ json }] = this.getInputData(index);
					items.push({ json, error, pairedItem: index });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = index;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: index,
					});
				}
			}
		}
		// @ts-ignore
		return this.prepareOutputData(outputs);
	}
}
