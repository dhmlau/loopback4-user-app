import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {UserCredentials} from '../models';
import {UserCredentialsRepository} from '../repositories';

export class UserCredentialsController {
  constructor(
    @repository(UserCredentialsRepository)
    public userCredentialsRepository : UserCredentialsRepository,
  ) {}

  @post('/user-credentials', {
    responses: {
      '200': {
        description: 'UserCredentials model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserCredentials)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredentials, {
            title: 'NewUserCredentials',
            exclude: ['id'],
          }),
        },
      },
    })
    userCredentials: Omit<UserCredentials, 'id'>,
  ): Promise<UserCredentials> {
    return this.userCredentialsRepository.create(userCredentials);
  }

  @get('/user-credentials/count', {
    responses: {
      '200': {
        description: 'UserCredentials model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(UserCredentials)) where?: Where<UserCredentials>,
  ): Promise<Count> {
    return this.userCredentialsRepository.count(where);
  }

  @get('/user-credentials', {
    responses: {
      '200': {
        description: 'Array of UserCredentials model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserCredentials, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(UserCredentials)) filter?: Filter<UserCredentials>,
  ): Promise<UserCredentials[]> {
    return this.userCredentialsRepository.find(filter);
  }

  @patch('/user-credentials', {
    responses: {
      '200': {
        description: 'UserCredentials PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredentials, {partial: true}),
        },
      },
    })
    userCredentials: UserCredentials,
    @param.query.object('where', getWhereSchemaFor(UserCredentials)) where?: Where<UserCredentials>,
  ): Promise<Count> {
    return this.userCredentialsRepository.updateAll(userCredentials, where);
  }

  @get('/user-credentials/{id}', {
    responses: {
      '200': {
        description: 'UserCredentials model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserCredentials, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter', getFilterSchemaFor(UserCredentials)) filter?: Filter<UserCredentials>
  ): Promise<UserCredentials> {
    return this.userCredentialsRepository.findById(id, filter);
  }

  @patch('/user-credentials/{id}', {
    responses: {
      '204': {
        description: 'UserCredentials PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserCredentials, {partial: true}),
        },
      },
    })
    userCredentials: UserCredentials,
  ): Promise<void> {
    await this.userCredentialsRepository.updateById(id, userCredentials);
  }

  @put('/user-credentials/{id}', {
    responses: {
      '204': {
        description: 'UserCredentials PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() userCredentials: UserCredentials,
  ): Promise<void> {
    await this.userCredentialsRepository.replaceById(id, userCredentials);
  }

  @del('/user-credentials/{id}', {
    responses: {
      '204': {
        description: 'UserCredentials DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userCredentialsRepository.deleteById(id);
  }
}
