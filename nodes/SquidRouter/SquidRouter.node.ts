import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

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
		for (let index = 0; index < items.length; index++) {
			// const item: INodeExecutionData = items[itemIndex];
			try {
				// const myString = this.getNodeParameter('myString', itemIndex, '') as string;
				outputs.push({ json: {} });
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
		return this.prepareOutputData(outputs);
	}
}
